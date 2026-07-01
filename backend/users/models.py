from typing import List, Optional
from pydantic import BaseModel, Field

class UserProfileSchema(BaseModel):
    protein_target: int = Field(30, ge=10, le=100)
    calorie_target: int = Field(600, ge=300, le=1500)
    diet_preference: str = Field("any", pattern="^(any|veg|non-veg)$")
    allergies: List[str] = Field(default_factory=list)
    dislikes: List[str] = Field(default_factory=list)
    favorite_cuisines: List[str] = Field(default_factory=list)
    fitness_goal: str = Field("maintenance")

class AddressSchema(BaseModel):
    id: str
    label: str
    display_text: str
