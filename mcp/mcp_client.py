class SwiggyFoodMCPClient:
    """Interface skeleton for future real Swiggy MCP integration."""

    def __init__(self, base_url: str, token: str) -> None:
        self.base_url = base_url
        self.token = token

    def get_addresses(self) -> list[dict]:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def search_restaurants(self, address_id: str, query: str) -> list[dict]:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def get_restaurant_menu(self, restaurant_id: str) -> list[dict]:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def search_menu(self, restaurant_id: str, query: str) -> list[dict]:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def update_food_cart(self, restaurant_id: str, items: list[dict]) -> dict:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def get_food_cart(self) -> dict:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def place_food_order(self, user_confirmed: bool) -> dict:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")

    def track_food_order(self, order_id: str) -> dict:
        raise NotImplementedError("Real Swiggy MCP client is not implemented yet.")
