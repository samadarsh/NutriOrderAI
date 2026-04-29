def score_meals(meals: list[dict], constraints: dict) -> list[dict]:
    ranked: list[dict] = []

    for meal in meals:
        if meal["price"] > constraints["budget_max_rs"]:
            continue
        if meal["delivery_time_min"] > constraints["max_delivery_time_min"]:
            continue

        preference = constraints["dietary_preference"]
        if preference != "any" and meal["dietary_preference"] != preference:
            continue

        protein_score = min(meal["protein_g"] / max(constraints["protein_target_g"], 1), 1.5) * 50
        budget_score = max(
            0,
            (constraints["budget_max_rs"] - meal["price"]) / max(constraints["budget_max_rs"], 1),
        ) * 25
        delivery_score = max(
            0,
            (constraints["max_delivery_time_min"] - meal["delivery_time_min"])
            / max(constraints["max_delivery_time_min"], 1),
        ) * 25

        meal_with_score = dict(meal)
        meal_with_score["score"] = protein_score + budget_score + delivery_score
        ranked.append(meal_with_score)

    ranked.sort(key=lambda meal: meal["score"], reverse=True)
    return ranked
