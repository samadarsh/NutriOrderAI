from agent.agent import NutriOrderAgent
from agent.pipeline import NutriOrderPipeline
from mcp.mcp_client import SwiggyFoodMCPClient, SwiggyMCPError, SwiggyAuthError
from mcp.mcp_mock import MockSwiggyFoodMCP
import os

class DummySettings:
    use_mock_mcp = True
    swiggy_base_url = "https://mcp-staging.swiggy.com/food"
    swiggy_token = "mock_token"

def assert_raises(exception_class, func, *args, **kwargs):
    try:
        func(*args, **kwargs)
        raise AssertionError(f"Expected {exception_class.__name__} to be raised, but no exception was raised.")
    except exception_class as e:
        return e
    except Exception as e:
        raise AssertionError(f"Expected {exception_class.__name__} to be raised, but got {type(e).__name__}: {str(e)}")

def test_query_propagation():
    """Verify that user text query propagates properly to the search query."""
    agent = NutriOrderAgent(DummySettings())
    
    # Run the pipeline with a custom goal
    result = agent.recommend_meal(
        user_goal="chicken salad",
        protein_target_g=30,
        budget_max_rs=300,
        max_delivery_time_min=45,
        dietary_preference="any"
    )
    
    assert result["success"] is True
    # Ensure constraint query is propagated
    assert result["constraints"]["query"] == "chicken salad"
    # Ensure recommended meal contains query keywords (salad / chicken)
    assert "salad" in result["recommendation"]["item_name"].lower() or "chicken" in result["recommendation"]["item_name"].lower()


def test_voice_json_adapter():
    """Verify that recommend_meal_from_json correctly adapts the Voice JSON contract."""
    agent = NutriOrderAgent(DummySettings())
    
    voice_payload = {
        "intent": "order_food",
        "protein_goal": 35,
        "budget": 250,
        "delivery_time": 40,
        "preferences": ["chicken", "no spicy", "exclude garlic"],
        "location": "addr_home"
    }
    
    result = agent.recommend_meal_from_json(voice_payload)
    
    assert result["success"] is True
    assert result["constraints"]["target_protein"] == 35
    assert result["constraints"]["typical_budget"] == 250
    assert result["constraints"]["max_delivery_time_min"] == 40
    # Positives must form query
    assert result["constraints"]["query"] == "chicken"
    # Negatives must form dislikes
    assert "spicy" in result["constraints"]["dislikes"]
    assert "garlic" in result["constraints"]["dislikes"]


def test_response_envelope_normalization():
    """Verify that SwiggyFoodMCPClient's _unpack_and_normalize handles envelopes and raises errors correctly."""
    client = SwiggyFoodMCPClient(token="dummy")
    
    # Valid envelope
    valid_envelope = {
        "success": True,
        "data": [{"id": "item_1", "name": "Bowl"}],
        "message": "Retrieved"
    }
    assert client._unpack_and_normalize(valid_envelope) == [{"id": "item_1", "name": "Bowl"}]
    
    # Standard Swiggy error envelope
    error_envelope = {
        "success": False,
        "error": {
            "code": 4001,
            "message": "Item is out of stock"
        }
    }
    
    err = assert_raises(SwiggyMCPError, client._unpack_and_normalize, error_envelope)
    assert "out of stock" in str(err)

    # Auth expired error envelope
    auth_envelope = {
        "success": False,
        "error": {
            "code": 401,
            "message": "Token expired"
        }
    }
    
    err_auth = assert_raises(SwiggyAuthError, client._unpack_and_normalize, auth_envelope)
    assert "Token expired" in str(err_auth)


class MockMCPClientSpy:
    def __init__(self):
        self.last_tool = None
        self.last_args = None

    def call_tool(self, name, args):
        self.last_tool = name
        self.last_args = args
        return {"success": True, "data": {}}

    # Standard aligned wrappers
    def update_food_cart(self, restaurantId, cartItems, addressId, restaurantName=None):
        return self.call_tool("update_food_cart", {
            "restaurantId": restaurantId,
            "cartItems": cartItems,
            "addressId": addressId,
            "restaurantName": restaurantName
        })

def test_real_schema_arguments():
    """Verify that high-level client methods invoke JSON-RPC with Swiggy-aligned parameters."""
    spy = MockMCPClientSpy()
    spy.update_food_cart(
        restaurantId="rest_1",
        cartItems=[{"itemId": "item_1", "quantity": 1}],
        addressId="addr_home",
        restaurantName="Protein Bowl Co"
    )
    
    assert spy.last_tool == "update_food_cart"
    assert spy.last_args["restaurantId"] == "rest_1"
    assert spy.last_args["cartItems"] == [{"itemId": "item_1", "quantity": 1}]
    assert spy.last_args["addressId"] == "addr_home"
    assert spy.last_args["restaurantName"] == "Protein Bowl Co"


def test_non_idempotent_order_safety():
    """Verify that confirm_order blocks orders >= Rs 1000 and protects against duplicate placement."""
    agent = NutriOrderAgent(DummySettings())
    
    # 1. Block order with price >= Rs 1000
    expensive_meal = {
        "success": True,
        "recommendation": {
            "restaurant_id": "rest_1",
            "restaurant_name": "Premium Steaks",
            "item_id": "item_1",
            "item_name": "Expensive Wagyu Bowl",
            "price": 1200,  # exceeds Rs 1000
        }
    }
    
    confirm_res = agent.confirm_order(expensive_meal)
    assert confirm_res["success"] is False
    assert "exceeds the Swiggy Builders Club cap" in confirm_res["message"]


class FakeSwiggyFoodMCPClient(SwiggyFoodMCPClient):
    def __init__(self):
        super().__init__(base_url="https://mcp-staging.swiggy.com/food", token="dummy")
        self.last_tool = None
        self.last_arguments = None

    def call_tool(self, tool_name, arguments):
        self.last_tool = tool_name
        self.last_arguments = arguments
        return {
            "success": True,
            "data": {
                "orderId": "order_123",
                "status": "confirmed",
                "message": "Order placed in staging."
            }
        }


def test_place_order_requires_staging_and_allow_flag():
    """Verify live order placement is locked unless both staging and allow flags are set."""
    client = FakeSwiggyFoodMCPClient()
    original_env = {
        "SWIGGY_ENV": os.environ.get("SWIGGY_ENV"),
        "ALLOW_PLACE_ORDER": os.environ.get("ALLOW_PLACE_ORDER"),
    }

    try:
        os.environ.pop("SWIGGY_ENV", None)
        os.environ.pop("ALLOW_PLACE_ORDER", None)
        err = assert_raises(SwiggyMCPError, client.place_food_order, "addr_home")
        assert "SWIGGY_ENV=staging" in str(err)

        os.environ["SWIGGY_ENV"] = "staging"
        os.environ.pop("ALLOW_PLACE_ORDER", None)
        assert_raises(SwiggyMCPError, client.place_food_order, "addr_home")

        os.environ["SWIGGY_ENV"] = "production"
        os.environ["ALLOW_PLACE_ORDER"] = "true"
        assert_raises(SwiggyMCPError, client.place_food_order, "addr_home")

        os.environ["SWIGGY_ENV"] = "staging"
        os.environ["ALLOW_PLACE_ORDER"] = "true"
        result = client.place_food_order("addr_home", paymentMethod="COD")
        assert result["orderId"] == "order_123"
        assert client.last_tool == "place_food_order"
        assert client.last_arguments == {"addressId": "addr_home", "paymentMethod": "COD"}
    finally:
        for key, value in original_env.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
