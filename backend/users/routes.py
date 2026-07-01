from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from backend.auth.sessions import get_current_user_id
from backend.users.models import UserProfileSchema, AddressSchema

router = APIRouter(prefix="/me", tags=["User Profile"])

@router.get("/profile", response_model=UserProfileSchema)
async def get_user_profile(user_id: str = Depends(get_current_user_id)) -> Any:
    """
    Retrieves the authenticated user's long-term fitness and nutritional preferences profile.
    """
    # TODO: Load profile fields from PostgreSQL DB
    return UserProfileSchema(
        protein_target=30,
        calorie_target=600,
        diet_preference="any",
        allergies=[],
        dislikes=[],
        favorite_cuisines=["indian"],
        fitness_goal="maintenance"
    )

@router.put("/profile", response_model=Dict[str, str])
async def update_user_profile(
    profile: UserProfileSchema,
    user_id: str = Depends(get_current_user_id)
) -> Any:
    """
    Updates the authenticated user's long-term profile targets, allergies, and dislikes.
    """
    # TODO: Update user_profiles table in PostgreSQL DB
    return {"message": "Profile updated successfully."}

@router.get("/addresses", response_model=List[AddressSchema])
async def get_user_addresses(user_id: str = Depends(get_current_user_id)) -> Any:
    """
    Retrieves the user's saved shipping addresses from Swiggy's address book.
    """
    # TODO: Call ProductionSwiggyClient(user_id).get_addresses()
    return [
        {"id": "addr_home", "label": "Home", "display_text": "Bengaluru Home Address"}
    ]
