# NutriOrder AI - End-to-End Mock Journey Demo Guide

This guide walks you through validating the complete production-grade multi-user mock ordering journey.

---

## 🚀 Step 1: Start Backend and Frontend Servers

Make sure your configuration is loaded and mock mode is active in your environment (or `.env` file):
```bash
APP_ENV=development
USE_MOCK_MCP=true
SWIGGY_ENV=mock
```

1. **Start the FastAPI Backend**:
   ```bash
   source .venv/bin/activate
   python -m backend.main
   ```
   *Verify status at: `http://localhost:8000/auth/swiggy/status`*

2. **Start the Next.js Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Open your browser to: `http://localhost:3000/`*

---

## 🥗 Step 2: The Ordering Journey Script

Follow these steps to demonstrate the full system capabilities:

### 1. Account Onboarding & Biometrics Setup
* Click the **"Start Demo Session"** button. This automatically provisions a new mock user and attaches an HTTP-only secure cookie.
* The **Biometrics Onboarding Panel** will slide in from the right:
  - Input: **Age** (e.g. `28`), **Gender** (e.g. `Male`), **Height** (e.g. `182` cm), **Weight** (e.g. `82` kg), **Activity Level** (e.g. `Moderate`), and **Fitness Goal** (e.g. `Muscle Gain`).
  - Click **"Calculate and Save Profile"**.
  - *Observation*: Notice BMR and TDEE calorie/protein goals are calculated dynamically using Mifflin-St Jeor and saved to the SQLite database.

### 2. Address Picker Selection
* Under **"Delivery Address"**, select one of the mock delivery addresses retrieved dynamically from the user's profile database (e.g. `"Office - Bangalore"`).
* *Observation*: An active database order session is created for this selected address context.

### 3. Personalization Priorities Sliders
* Try adjusting the Priority Weights sliders (e.g. boost **Protein** and **Budget** priority, and reduce **Taste** priority).
* *Observation*: These weight coefficients will be sent to the backend search API to influence ranking matches.

### 4. Recommendation Search
* Enter search query **"chicken salad"** in the assistant input field and click **"Search"**.
* *Observation*:
  - The backend matches and ranks candidate Swiggy meals.
  - Review the **Recommendation Match Score** (e.g. `92% Match`).
  - Click the card to view **Explainable Reasoning** highlights (`why_this_meal` benefits like alignment with daily protein goals, and `tradeoffs` warnings if fat/calorie caps are exceeded).

### 5. Smart Constraint Relaxation (Optional)
* Try searching for a highly restrictive query, such as `"low calorie cheese pizza under Rs 100"`.
* *Observation*:
  - If 0 matches are found, review the **Smart Constraint Relaxation** patch cards (e.g. `"Increase budget limit to Rs 350"` or `"Relax calorie constraint to 800 kcal"`).
  - Click a relaxation card to instantly execute the search with overridden parameters.

### 6. Cart Selection & Safety Warning Checkout
* Select a recommended meal (e.g., `"Peri Peri Chicken Salad"`) to add it to your Swiggy cart.
* Click **"Review Cart & Place Order"**.
* *Observation*:
  - Confirm the total order bill remains below the safety lock of **Rs 1000**.
  - Verify payment method (e.g., Cash on Delivery).

### 7. Explicit Confirmation & Tracking
* Click the explicit final button: **"Place COD Order on Swiggy"**.
* *Observation*: The session state machine transitions to `USER_CONFIRMED` -> `ORDER_PLACING` -> `ORDER_PLACED`, showing a live tracking dashboard with delivery countdown and status updates.

### 8. Feedback Loop & Personalization Adaptation
* In the tracking window, click **"Provide Post-Order Feedback"**.
* Select options (e.g., rating the meal as **"Too Spicy"**).
* Click **"Submit Feedback"**.
* *Observation*:
  - Close the modal and inspect the onboarded profile panel.
  - Notice the user's `spice_tolerance` has adjusted from `"medium"` to `"low"`, and `"spicy"` is automatically appended to their `dislikes` list.
