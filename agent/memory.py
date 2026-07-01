import json
from pathlib import Path
from typing import Any, Dict, List
from agent.observability import log_info, log_error

class UserMemoryManager:
    def __init__(self, memory_filepath: str = "outputs/user_memory.json") -> None:
        self.filepath = Path(memory_filepath)
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        self.default_profile = {
            "dislikes": [],
            "allergies": [],
            "favorite_cuisines": [],
            "preferred_restaurants": [],
            "typical_budget": 300,
            "fitness_goal": "muscle_gain",  # muscle_gain, fat_loss, maintenance, general
            "target_protein": 30,
            "target_calories": 650,
            "preferences": []
        }
        self.profile = self.load_memory()

    def load_memory(self) -> Dict[str, Any]:
        if not self.filepath.exists():
            log_info("No user memory profile found. Initializing with defaults.")
            return dict(self.default_profile)
        
        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure all default keys exist
                profile = dict(self.default_profile)
                profile.update(data)
                return profile
        except Exception as e:
            log_error(f"Failed to load user memory: {str(e)}", error_category="internal_error")
            return dict(self.default_profile)

    def save_memory(self) -> bool:
        try:
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.profile, f, indent=2, ensure_ascii=False)
            log_info("User memory profile saved successfully.")
            return True
        except Exception as e:
            log_error(f"Failed to save user memory: {str(e)}", error_category="internal_error")
            return False

    def update_profile(self, updates: Dict[str, Any]) -> None:
        self.profile.update(updates)
        self.save_memory()

    def add_dislike(self, item: str) -> None:
        item = item.strip().lower()
        if item and item not in self.profile["dislikes"]:
            self.profile["dislikes"].append(item)
            self.save_memory()

    def remove_dislike(self, item: str) -> None:
        item = item.strip().lower()
        if item in self.profile["dislikes"]:
            self.profile["dislikes"].remove(item)
            self.save_memory()

    def add_allergy(self, allergen: str) -> None:
        allergen = allergen.strip().lower()
        if allergen and allergen not in self.profile["allergies"]:
            self.profile["allergies"].append(allergen)
            self.save_memory()

    def remove_allergy(self, allergen: str) -> None:
        allergen = allergen.strip().lower()
        if allergen in self.profile["allergies"]:
            self.profile["allergies"].remove(allergen)
            self.save_memory()

    def add_favorite_cuisine(self, cuisine: str) -> None:
        cuisine = cuisine.strip().lower()
        if cuisine and cuisine not in self.profile["favorite_cuisines"]:
            self.profile["favorite_cuisines"].append(cuisine)
            self.save_memory()

    def remove_favorite_cuisine(self, cuisine: str) -> None:
        cuisine = cuisine.strip().lower()
        if cuisine in self.profile["favorite_cuisines"]:
            self.profile["favorite_cuisines"].remove(cuisine)
            self.save_memory()

    def reset_profile(self) -> None:
        self.profile = dict(self.default_profile)
        self.save_memory()
        log_info("User memory profile reset to defaults.")

    def get_merged_constraints(self, session_constraints: Dict[str, Any]) -> Dict[str, Any]:
        """Merge long-term user memory preferences with session-specific constraints.
        
        Session constraints take precedence if they are explicitly specified
        and differ from defaults.
        """
        merged = dict(self.profile)
        
        # Override with session values if they are active
        budget = session_constraints.get("budget_max_rs") or session_constraints.get("budget")
        if budget:
            merged["typical_budget"] = budget
            
        protein = session_constraints.get("protein_target_g") or session_constraints.get("protein_goal")
        if protein:
            merged["target_protein"] = protein
            
        goal_text = session_constraints.get("user_goal") or session_constraints.get("query")
        if goal_text:
            goal = goal_text.lower()
            if "muscle" in goal or "bulk" in goal:
                merged["fitness_goal"] = "muscle_gain"
            elif "fat" in goal or "weight loss" in goal or "lean" in goal or "diet" in goal:
                merged["fitness_goal"] = "fat_loss"
            elif "maintenance" in goal or "maintain" in goal:
                merged["fitness_goal"] = "maintenance"

        # dietary preferences mapping
        diet_pref = session_constraints.get("dietary_preference", "any")
        if diet_pref != "any":
            merged["dietary_preference"] = diet_pref
        else:
            merged["dietary_preference"] = self.profile.get("dietary_preference", "any")

        # Include session preferences in preferences array
        session_prefs = session_constraints.get("preferences", [])
        if isinstance(session_prefs, list):
            combined_prefs = list(set(self.profile.get("preferences", []) + session_prefs))
            merged["preferences"] = combined_prefs

        # Propagate query, dislikes, and allergies
        merged["query"] = session_constraints.get("query") or session_constraints.get("user_goal") or "high protein"
        
        session_dislikes = session_constraints.get("dislikes", [])
        if session_dislikes:
            merged["dislikes"] = list(set(self.profile.get("dislikes", []) + session_dislikes))
            
        session_allergies = session_constraints.get("allergies", [])
        if session_allergies:
            merged["allergies"] = list(set(self.profile.get("allergies", []) + session_allergies))

        return merged
