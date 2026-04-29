class MockSwiggyFoodMCP:
    def __init__(self) -> None:
        self._cart = {"restaurant_id": None, "items": []}
        self._orders: dict[str, dict] = {}
        self._restaurants = [
            {
                "id": "rest_1",
                "name": "Protein Bowl Co",
                "delivery_time_min": 28,
                "menu": [
                    {
                        "id": "item_1",
                        "name": "Grilled Chicken Rice Bowl",
                        "protein_g": 42,
                        "price": 289,
                        "dietary_preference": "non-veg",
                    },
                    {
                        "id": "item_2",
                        "name": "Paneer Power Bowl",
                        "protein_g": 31,
                        "price": 249,
                        "dietary_preference": "veg",
                    },
                ],
            },
            {
                "id": "rest_2",
                "name": "Lean Meal Hub",
                "delivery_time_min": 34,
                "menu": [
                    {
                        "id": "item_3",
                        "name": "Double Egg Wrap",
                        "protein_g": 24,
                        "price": 179,
                        "dietary_preference": "non-veg",
                    },
                    {
                        "id": "item_4",
                        "name": "Tofu Burrito Bowl",
                        "protein_g": 27,
                        "price": 219,
                        "dietary_preference": "veg",
                    },
                ],
            },
            {
                "id": "rest_3",
                "name": "Fit Feast Kitchen",
                "delivery_time_min": 41,
                "menu": [
                    {
                        "id": "item_5",
                        "name": "Peri Peri Chicken Salad",
                        "protein_g": 36,
                        "price": 299,
                        "dietary_preference": "non-veg",
                    },
                    {
                        "id": "item_6",
                        "name": "High Protein Soya Salad",
                        "protein_g": 29,
                        "price": 199,
                        "dietary_preference": "veg",
                    },
                ],
            },
        ]

    def get_addresses(self) -> list[dict]:
        return [
            {
                "id": "addr_home",
                "label": "Home",
                "display_text": "Bengaluru Home Address",
            }
        ]

    def search_restaurants(self, address_id: str, query: str) -> list[dict]:
        _ = address_id
        _ = query
        return [
            {
                "id": restaurant["id"],
                "name": restaurant["name"],
                "delivery_time_min": restaurant["delivery_time_min"],
            }
            for restaurant in self._restaurants
        ]

    def get_restaurant_menu(self, restaurant_id: str) -> list[dict]:
        for restaurant in self._restaurants:
            if restaurant["id"] == restaurant_id:
                return restaurant["menu"]
        return []

    def search_menu(self, restaurant_id: str, query: str) -> list[dict]:
        normalized_query = query.lower()
        return [
            item
            for item in self.get_restaurant_menu(restaurant_id)
            if normalized_query in item["name"].lower()
        ]

    def update_food_cart(self, restaurant_id: str, items: list[dict]) -> dict:
        self._cart = {
            "restaurant_id": restaurant_id,
            "items": items,
            "message": "Mock cart updated successfully.",
        }
        return dict(self._cart)

    def get_food_cart(self) -> dict:
        return dict(self._cart)

    def place_food_order(self, user_confirmed: bool) -> dict:
        if not user_confirmed:
            return {
                "success": False,
                "message": "Mock order was not placed because user confirmation was missing.",
            }

        if not self._cart["items"]:
            return {
                "success": False,
                "message": "Mock order was not placed because the cart is empty.",
            }

        order_id = f"mock_order_{len(self._orders) + 1}"
        order = {
            "success": True,
            "order_id": order_id,
            "status": "confirmed",
            "message": "Mock order confirmed. No real Swiggy order was placed.",
            "cart": dict(self._cart),
        }
        self._orders[order_id] = order
        return order

    def track_food_order(self, order_id: str) -> dict:
        order = self._orders.get(order_id)
        if not order:
            return {
                "success": False,
                "message": "Mock order not found.",
                "order_id": order_id,
            }

        return {
            "success": True,
            "order_id": order_id,
            "status": order["status"],
            "message": "Mock tracking response. No real delivery is in progress.",
        }
