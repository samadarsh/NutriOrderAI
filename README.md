# NutriOrder AI

AI-powered fitness meal ordering agent that helps users discover and choose meals based on protein goals, budget, dietary preferences, and delivery constraints.

---

## Problem

Users struggle to consistently find meals that match:
- Daily protein targets
- Budget constraints
- Delivery time expectations
- Healthy eating habits

Food ordering apps provide options, but not decision-making.

---

## Solution

NutriOrder AI acts as an intelligent decision layer on top of Swiggy Food MCP.

It:
- Understands user intent such as "high protein dinner under Rs 300"
- Converts that request into structured meal constraints
- Searches available food options through Swiggy MCP
- Ranks meals using nutrition, price, and delivery-aware scoring
- Recommends a best-fit meal and can prepare the order flow

---

## Core Features

- High-protein meal discovery
- Budget-aware ranking
- Fast-delivery filtering
- Goal-driven meal recommendations
- MCP-ready food ordering workflow

---

## Architecture

User -> Streamlit UI -> AI Agent -> Swiggy Food MCP -> Recommendation / Order Flow

### Canonical Food Flow
1. User inputs goal, budget, and preference
2. Agent resolves the delivery address context
3. Target Swiggy Food MCP sequence for live integration:
   - `get_addresses`
   - `search_restaurants`
   - `get_restaurant_menu`
   - `update_food_cart`
   - `get_food_cart`
   - `place_food_order`
4. NutriOrder ranks candidate meals using nutrition + cost + delivery scoring
5. Final recommendation is shown before order confirmation
6. Current scaffold stops at recommendation plus mock cart preparation

---

## Project Structure

```text
NutriOrderAI/
├── app.py
├── agent/
│   └── agent.py
├── mcp/
│   ├── mcp_mock.py
│   └── mcp_client.py
├── utils/
│   └── nutrition_scorer.py
├── config/
│   └── settings.py
├── requirements.txt
├── .env.example
├── README.md
└── .gitignore
```

---

## Tech Stack

- Frontend: Streamlit
- Agent Layer: Python orchestration layer
- MCP Integration: Swiggy Food MCP
- Config: `python-dotenv`
- Future Agent Upgrade Path: OpenAI Agents SDK or LangGraph

---

## Current MVP Scope

This repository currently focuses on:
- A local Streamlit interface
- A mock MCP integration for development
- Nutrition-first recommendation logic
- A clean structure for swapping in a real Swiggy MCP client later

---

## Status

- MVP scaffold in progress
- Mock MCP flow used for local development
- Real Swiggy MCP authentication and production access can be integrated later

---

## Future Improvements

- Real Swiggy MCP client integration
- Cart review and confirmation UI
- User preference persistence
- Calorie and macro tracking
- Weekly meal planning
- Fitness tracker integration
