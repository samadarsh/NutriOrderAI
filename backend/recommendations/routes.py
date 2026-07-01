from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.auth.sessions import get_current_user_id
from backend.auth.rate_limiter import mutating_rate_limiter
from backend.db.session import get_db
from backend.db.models import OrderSession
from backend.orders.state_machine import OrderStatus, transition_session_status
from backend.mcp.swiggy_client import ProductionSwiggyClient
from agent.memory import UserMemoryManager
from agent.personalization import PersonalizationEngine
from agent.pipeline import NutriOrderPipeline

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/search")
async def search_recommendations(
    session_id: str = Query(..., description="ID of the active order session"),
    query: str = Query(..., description="Meal search query (e.g. 'high protein lunch')"),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    _rate_limit = Depends(mutating_rate_limiter)
) -> Dict[str, Any]:
    """
    Executes the ranking pipeline for the session query, transitioning status to RECOMMENDATIONS_READY.
    """
    # 1. Fetch OrderSession
    session_record = db.query(OrderSession).filter(
        OrderSession.id == session_id,
        OrderSession.user_id == user_id
    ).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Order session not found.")
        
    # Check transition compatibility
    current_status = OrderStatus(session_record.status)
    if current_status not in [OrderStatus.START, OrderStatus.ADDRESS_SELECTED, OrderStatus.SEARCHING, OrderStatus.RECOMMENDATIONS_READY]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot query recommendations in state {current_status.value}"
        )
        
    # Transition status to SEARCHING
    transition_session_status(db, session_record, OrderStatus.SEARCHING)

    try:
        # 2. Instantiate Swiggy client
        swiggy = ProductionSwiggyClient(user_id=user_id)
        
        # 3. Instantiate DB-backed memory manager
        memory_mgr = UserMemoryManager(db=db, user_id=user_id)
        personalization = PersonalizationEngine()
        
        # 4. Run ranking pipeline
        pipeline = NutriOrderPipeline(
            mcp_client=swiggy,
            memory_manager=memory_mgr,
            personalization_engine=personalization
        )
        
        # We pass explicit address_id selected in the session
        address_id = session_record.address_id or "addr_home"
        results = pipeline.run_pipeline(
            raw_input=query,
            session_constraints={"addressId": address_id},
            address_id=address_id
        )
        
        # 5. Save query and transition status to RECOMMENDATIONS_READY
        session_record.query = query
        transition_session_status(db, session_record, OrderStatus.RECOMMENDATIONS_READY)
        db.commit()
        
        return {
            "success": True,
            "session_id": session_id,
            "status": OrderStatus.RECOMMENDATIONS_READY.value,
            "results": results
        }
    except Exception as e:
        transition_session_status(db, session_record, OrderStatus.FAILED)
        raise HTTPException(status_code=500, detail=f"Recommendation query failed: {str(e)}")
