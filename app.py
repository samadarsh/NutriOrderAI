import streamlit as st

from agent.agent import NutriOrderAgent
from config.settings import get_settings


def render_result(result: dict) -> None:
    recommendation = result["recommendation"]
    constraints = result["constraints"]

    st.subheader("Recommended Meal")
    st.write(f"Restaurant: {recommendation['restaurant_name']}")
    st.write(f"Meal: {recommendation['item_name']}")
    st.write(f"Protein: {recommendation['protein_g']} g")
    st.write(f"Price: Rs {recommendation['price']}")
    st.write(f"ETA: {recommendation['delivery_time_min']} min")
    st.write(f"Score: {round(recommendation['score'], 2)}")

    st.subheader("Why This Was Chosen")
    st.write(
        f"This result best fits a protein target of at least {constraints['protein_target_g']} g "
        f"within a budget of Rs {constraints['budget_max_rs']}."
    )

    if result.get("cart_preview"):
        st.subheader("Mock Cart Preview")
        st.json(result["cart_preview"])

    if result.get("cart_state"):
        st.subheader("Cart State")
        st.json(result["cart_state"])


def render_confirmation_result(result: dict) -> None:
    if not result["success"]:
        st.error(result["message"])
        return

    st.subheader("Order Confirmation")
    st.success(result["message"])
    st.json(result["order"])

    if result.get("tracking"):
        st.subheader("Tracking Preview")
        st.json(result["tracking"])

    if result.get("mock_mode"):
        st.info("This is a placeholder confirmation flow. No real Swiggy order was placed.")


def main() -> None:
    settings = get_settings()
    agent = NutriOrderAgent(settings=settings)

    st.set_page_config(page_title="NutriOrder AI", page_icon="🥗", layout="centered")
    st.title("NutriOrder AI")
    st.caption("Goal-driven meal recommendations powered by a mock Swiggy MCP flow.")

    with st.form("nutriorder_form"):
        user_goal = st.text_input(
            "What would you like to order?",
            value="High protein dinner under Rs 300",
        )
        protein_target = st.number_input("Minimum protein (g)", min_value=0, value=30)
        budget_max = st.number_input("Maximum budget (Rs)", min_value=50, value=300)
        max_delivery_time = st.number_input(
            "Maximum delivery time (minutes)",
            min_value=10,
            value=45,
        )
        dietary_preference = st.selectbox(
            "Dietary preference",
            options=["any", "veg", "non-veg"],
            index=0,
        )
        submitted = st.form_submit_button("Find my meal")

    if submitted:
        with st.spinner("Scoring meal options..."):
            result = agent.recommend_meal(
                user_goal=user_goal,
                protein_target_g=int(protein_target),
                budget_max_rs=int(budget_max),
                max_delivery_time_min=int(max_delivery_time),
                dietary_preference=dietary_preference,
            )

        if not result["success"]:
            st.error(result["message"])
            return

        st.session_state["latest_result"] = result
        st.session_state.pop("confirmation_result", None)

    latest_result = st.session_state.get("latest_result")
    if latest_result:
        render_result(latest_result)
        if latest_result.get("mock_mode"):
            st.info("Running in mock MCP mode. No real Swiggy order was placed.")

        if st.button("Confirm Order (Placeholder)"):
            confirmation_result = agent.confirm_order(latest_result)
            st.session_state["confirmation_result"] = confirmation_result

    confirmation_result = st.session_state.get("confirmation_result")
    if confirmation_result:
        render_confirmation_result(confirmation_result)


if __name__ == "__main__":
    main()
