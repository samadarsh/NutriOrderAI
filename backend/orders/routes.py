from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from backend.auth.sessions import get_current_user_id
from backend.orders.state_machine import OrderStatus, validate_state_transition

router = APIRouter(prefix="/orders", tags=["Order Sessions"])

@router.post("/session/start")
async def start_order_session(user_id: str = Depends(get_current_user_id)) -> Dict[str, Any]:
    """
    Spawns a new order session and sets initial state to START.
    """
    # TODO: Create record in order_sessions table
    return {
        "session_id": "session_12345",
        "status": OrderStatus.START
    }

@router.post("/session/{session_id}/select-address")
async def select_address(
    session_id: str,
    address_id: str,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Binds the user-selected addressId to the current order session.
    """
    # TODO: Transition to ADDRESS_SELECTED in DB
    return {
        "session_id": session_id,
        "address_id": address_id,
        "status": OrderStatus.ADDRESS_SELECTED
    }

@router.post("/session/{session_id}/place")
async def place_order(
    session_id: str,
    user_confirmed: bool,
    user_id: str = Depends(get_current_user_id)
) -> Dict[str, Any]:
    """
    Performs the non-idempotent Swiggy order placement, enforcing safety locks,
    cart cost thresholds (< Rs 1000), and double-placing verification checks.
    """
    if not user_confirmed:
        raise HTTPException(status_code=400, detail="Explicit user_confirmed parameter is required.")
        
    # TODO: Load session snapshot from DB, verify current state is USER_CONFIRMED
    # TODO: Perform get_food_orders check to ensure order is not already created
    # TODO: Call place_food_order on Swiggy MCP Staging after all guards pass
    raise HTTPException(
        status_code=501,
        detail="Order placement is not implemented in the production scaffold yet."
    )
