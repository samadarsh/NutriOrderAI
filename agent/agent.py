from dataclasses import dataclass
from typing import Any

from mcp.mcp_client import SwiggyFoodMCPClient
from mcp.mcp_mock import MockSwiggyFoodMCP
from utils.nutrition_scorer import score_meals


@dataclass
class MealConstraints:
    user_goal: str
    protein_target_g: int
    budget_max_rs: int
    max_delivery_time_min: int
    dietary_preference: str


class NutriOrderAgent:
    def __init__(self, settings: Any) -> None:
        self.settings = settings
        self.mcp = self._build_mcp_client()

    def _build_mcp_client(self) -> Any:
        if self.settings.use_mock_mcp:
            return MockSwiggyFoodMCP()
        return SwiggyFoodMCPClient(
            base_url=self.settings.swiggy_base_url,
            token=self.settings.swiggy_token,
        )

    def recommend_meal(
        self,
        user_goal: str,
        protein_target_g: int,
        budget_max_rs: int,
        max_delivery_time_min: int,
        dietary_preference: str,
    ) -> dict[str, Any]:
        constraints = MealConstraints(
            user_goal=user_goal,
            protein_target_g=protein_target_g,
            budget_max_rs=budget_max_rs,
            max_delivery_time_min=max_delivery_time_min,
            dietary_preference=dietary_preference,
        )

        addresses = self.mcp.get_addresses()
        if not addresses:
            return {"success": False, "message": "No saved delivery address found."}

        address = addresses[0]
        restaurants = self.mcp.search_restaurants(address_id=address["id"], query=user_goal)

        candidate_meals: list[dict[str, Any]] = []
        for restaurant in restaurants:
            menu = self.mcp.get_restaurant_menu(restaurant_id=restaurant["id"])
            for item in menu:
                candidate_meals.append(
                    {
                        "restaurant_id": restaurant["id"],
                        "restaurant_name": restaurant["name"],
                        "item_id": item["id"],
                        "item_name": item["name"],
                        "protein_g": item["protein_g"],
                        "price": item["price"],
                        "delivery_time_min": restaurant["delivery_time_min"],
                        "dietary_preference": item["dietary_preference"],
                    }
                )

        ranked_meals = score_meals(candidate_meals, constraints.__dict__)
        if not ranked_meals:
            return {
                "success": False,
                "message": "No meals matched the current protein, budget, and preference filters.",
            }

        best_meal = ranked_meals[0]
        cart_preview = self.mcp.update_food_cart(
            restaurant_id=best_meal["restaurant_id"],
            items=[{"item_id": best_meal["item_id"], "quantity": 1}],
        )
        cart_state = self.mcp.get_food_cart()

        return {
            "success": True,
            "constraints": constraints.__dict__,
            "recommendation": best_meal,
            "cart_preview": cart_preview,
            "cart_state": cart_state,
            "mock_mode": self.settings.use_mock_mcp,
        }

    def confirm_order(self, latest_result: dict[str, Any]) -> dict[str, Any]:
        if not latest_result.get("success"):
            return {"success": False, "message": "No valid recommendation is available to confirm."}

        order_response = self.mcp.place_food_order(user_confirmed=True)
        if not order_response.get("success"):
            return order_response

        tracking = self.mcp.track_food_order(order_response["order_id"])
        return {
            "success": True,
            "message": order_response["message"],
            "order": order_response,
            "tracking": tracking,
            "mock_mode": self.settings.use_mock_mcp,
        }
