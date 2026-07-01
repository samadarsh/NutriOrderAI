from enum import Enum
from typing import Dict, Any, List

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
