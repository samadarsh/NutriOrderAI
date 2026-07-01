from typing import Any, Dict, List
from agent.pipeline import NutriOrderPipeline
# TODO: Import database models and settings instead of relying on Streamlit environments

class ProductionRecommendationService:
    """
    Service Layer wrapper.
    Queries Swiggy MCP Staging and runs candidates through the custom ranking engine.
    """
    def __init__(self, mcp_client: Any, memory_manager: Any, personalization_engine: Any) -> None:
        self.pipeline = NutriOrderPipeline(
            mcp_client=mcp_client,
            memory_manager=memory_manager,
            personalization_engine=personalization_engine
        )

    async def get_ranked_recommendations(
        self,
        query: str,
        user_profile: Dict[str, Any],
        address_id: str
    ) -> Dict[str, Any]:
        """
        Executes the NutriOrder recommendation pipeline.
        Resolves query, filters constraints, ranks candidates, and returns results.
        """
        # Inject address_id and profiles
        session_constraints = {
            "user_goal": query,
            "protein_target_g": user_profile.get("protein_target", 30),
            "budget_max_rs": user_profile.get("typical_budget", 300),
            "max_delivery_time_min": 45,
            "dietary_preference": user_profile.get("dietary_preference", "any"),
            "addressId": address_id
        }
        
        # Run recommendation pipeline
        result = self.pipeline.run_pipeline(query, session_constraints)
        return result
