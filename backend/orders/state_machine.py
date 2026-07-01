from enum import Enum
from typing import Dict, Any, List
import datetime
from sqlalchemy.orm import Session
from backend.db.models import OrderSession, OrderEvent

class OrderStatus(str, Enum):
    START = "START"
    ADDRESS_SELECTED = "ADDRESS_SELECTED"
    SEARCHING = "SEARCHING"
    RECOMMENDATIONS_READY = "RECOMMENDATIONS_READY"
    ITEM_SELECTED = "ITEM_SELECTED"
    CART_UPDATED = "CART_UPDATED"
    CART_REVIEW_READY = "CART_REVIEW_READY"
    USER_CONFIRMED = "USER_CONFIRMED"
    ORDER_PLACING = "ORDER_PLACING"
    ORDER_PLACED = "ORDER_PLACED"
    TRACKING = "TRACKING"
    FAILED = "FAILED"

# Allowed forward transition rules to ensure safety
ALLOWED_TRANSITIONS = {
    OrderStatus.START: [OrderStatus.ADDRESS_SELECTED],
    OrderStatus.ADDRESS_SELECTED: [OrderStatus.SEARCHING, OrderStatus.START],
    OrderStatus.SEARCHING: [OrderStatus.RECOMMENDATIONS_READY, OrderStatus.FAILED],
    OrderStatus.RECOMMENDATIONS_READY: [OrderStatus.ITEM_SELECTED, OrderStatus.SEARCHING],
    OrderStatus.ITEM_SELECTED: [OrderStatus.CART_UPDATED, OrderStatus.FAILED],
    OrderStatus.CART_UPDATED: [OrderStatus.CART_REVIEW_READY],
    OrderStatus.CART_REVIEW_READY: [OrderStatus.USER_CONFIRMED, OrderStatus.ITEM_SELECTED],
    OrderStatus.USER_CONFIRMED: [OrderStatus.ORDER_PLACING],
    OrderStatus.ORDER_PLACING: [OrderStatus.ORDER_PLACED, OrderStatus.FAILED],
    OrderStatus.ORDER_PLACED: [OrderStatus.TRACKING],
    OrderStatus.TRACKING: [],
    OrderStatus.FAILED: [OrderStatus.START]
}

def validate_state_transition(current: OrderStatus, target: OrderStatus) -> bool:
    """
    Returns True if target state transition is permitted under strict safety guidelines.
    """
    return target in ALLOWED_TRANSITIONS.get(current, [])

def transition_session_status(db: Session, session_record: OrderSession, target: OrderStatus) -> OrderSession:
    """
    Safely transitions the session state and logs a status transition event in the DB.
    """
    current = OrderStatus(session_record.status)
    if not validate_state_transition(current, target):
        raise ValueError(f"Illegal state transition from {current.value} to {target.value}")
        
    session_record.status = target.value
    session_record.updated_at = datetime.datetime.now()
    
    # Create audit event
    event = OrderEvent(
        order_session_id=session_record.id,
        event_type=f"STATUS_TRANSITION",
        payload={"from_status": current.value, "to_status": target.value}
    )
    db.add(event)
    db.commit()
    db.refresh(session_record)
    return session_record
