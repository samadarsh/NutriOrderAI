# NutriOrder AI

AI-powered nutrition-aware food ordering agent that recommends high-protein meals based on user goals, budget, and preferences — and places confirmed orders through Swiggy MCP.

---

## 🚀 Problem

Users struggle to consistently find meals that match:
- Daily protein targets  
- Budget constraints  
- Delivery time expectations  
- Healthy eating habits  

Food ordering apps provide options — but not intelligent decision-making.

---

## 💡 Solution

NutriOrder AI acts as an AI-driven decision layer on top of Swiggy, enabling users to:

- Discover meals aligned with fitness goals (high protein, low calorie, etc.)
- Stay within budget
- Reduce decision fatigue
- Order efficiently with AI-assisted recommendations

---

## 🧠 Core Features

- 🥩 Nutrition-aware meal recommendations  
- 💰 Budget-constrained ordering  
- ⏱️ Delivery-time optimization  
- 🤖 AI-driven ranking of menu items  
- 🛒 Smart cart management via Swiggy MCP  
- ✅ Safe order placement with user confirmation  
- 📦 Real-time order tracking  

---

## ⚙️ Architecture

User → Frontend → AI Agent → Address Resolution → Swiggy MCP Food Server → Nutrition Scoring → Cart → User Confirmation → Order Placement

### Flow:

1. User inputs goal (protein, budget, dietary preference)  
2. AI agent converts input into structured constraints  
3. Resolve delivery location using:
   - `get_addresses`  

4. Discover restaurants:
   - `search_restaurants`  

5. Retrieve menu data:
   - `get_restaurant_menu` / `search_menu`  

6. AI Processing:
   - Rank meals based on:
     - Estimated protein value  
     - Price  
     - Delivery time  
     - User preferences  

7. Build cart:
   - `update_food_cart`  

8. Verify cart before ordering:
   - `get_food_cart`  

9. User confirmation step (mandatory)  

10. Place order safely:
   - `place_food_order`  

11. Track order:
   - `track_food_order`  

---

## ⚠️ Compliance & Safety

- Orders are placed **only after explicit user confirmation**  
- Cart is always verified before placing an order  
- Food cart is tied to a single restaurant  
- No blind retries on order placement (non-idempotent operation)  
- COD (Cash on Delivery) supported in v1  
- Cart value handled within Swiggy Builders limits  

---

## 🧰 Tech Stack

- Frontend: Next.js / Streamlit  
- Backend: FastAPI  
- Agent Layer: LangGraph / OpenAI Agents SDK  
- Execution Layer: Swiggy MCP (Food Server)  
- Database: PostgreSQL / SQLite  
- Auth: OAuth 2.1 (PKCE)  

---

## 🔗 MCP Integration

NutriOrder AI integrates with Swiggy’s Model Context Protocol (MCP):

- Uses Swiggy Food MCP server  
- Executes actions via authenticated API calls  
- Processes structured JSON responses for decision-making  
- Maintains server-side cart state  

---

## 🧪 Demo Flow

1. User: “Order me a high-protein dinner under ₹300”  
2. Agent filters meals based on protein + price  
3. Ranks optimal choices  
4. Adds item to cart  
5. Requests user confirmation  
6. Places order via MCP  
7. Tracks order status  

---

## 📌 Status

🚧 Currently in MVP development phase  
🧪 Prototyping against local/staging flow  
🔐 Production Swiggy MCP access pending approval  

---

## 🔮 Future Improvements

- Instamart integration (grocery-based meal planning)  
- Macro tracking (protein, carbs, fats)  
- Voice-based ordering agent  
- Personalized diet profiles  
- Integration with fitness apps  

---

## 👤 Author

Sam Adarsh  
AI & Data Science | Building AI systems for real-world automation  
Founder @ Haugtun  

---

## 📝 Note

This project is being built as part of the Swiggy Builders Club program.
