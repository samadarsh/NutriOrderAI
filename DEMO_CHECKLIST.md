# BiteWise — Demo Checklist

Pre-demo verification checklist. Run through this before every pitch session.

---

## Environment Setup

- [ ] `.env` file exists with `USE_MOCK_MCP=true`
- [ ] SQLite database file exists (auto-created on first run)
- [ ] Python virtual environment is active

## Backend Server

```bash
.venv/bin/python -m uvicorn backend.main:app --port 8000 --reload
```

- [ ] Backend starts without errors
- [ ] `curl http://localhost:8000/health` returns `{"status":"ok"}`
- [ ] `curl http://localhost:8000/auth/swiggy/status` returns `use_mock_mcp: true`

## Frontend Server

```bash
cd frontend && npm run dev
```

- [ ] Frontend starts on port 3000
- [ ] `http://localhost:3000` loads the landing page

## Quick Diagnostics

```bash
.venv/bin/python scripts/dev_check.py
```

- [ ] All checks pass (backend, frontend, env, db)

---

## Landing Page Verification (`/`)

- [ ] BiteWise hero renders with "NutriOrder AI and SmartPantry AI" badge
- [ ] Stats bar shows: 2 products, 52+ tests, 10 recipes, 1 safety-gated checkout
- [ ] "Continue with Swiggy" button is **not** disabled
- [ ] "Try Sandbox Demo" button appears (mock mode)
- [ ] "Watch the Demo →" button links to `/pitch`
- [ ] "Demo Walkthrough" nav link is visible
- [ ] Product cards section shows NutriOrder AI and SmartPantry AI
- [ ] Footer renders at bottom

## Pitch Page Verification (`/pitch`)

- [ ] Sticky progress bar shows BiteWise logo + 5 dots
- [ ] Environment check detects live mode (green "● Live Data" badge)
- [ ] "Start Live Demo" button appears
- [ ] Click "Start Live Demo" → loading spinner → steps render
- [ ] Step 1: Profile cards show muscle_gain, 2200 kcal, 120g protein, peanuts allergy
- [ ] Step 2: 3 recommendation cards with scores and confidence
- [ ] Step 3: Low-stock alerts (Rice out-of-stock, Milk/Curd/Tomato low)
- [ ] Step 3: Auto-restock notification for Rice
- [ ] Step 3: Household insights (3 members, 5400 kcal total, peanuts allergen)
- [ ] Step 4: Recipe suggestions with coverage bars
- [ ] Step 4: Skipped recipes with reasons (Butter Chicken → veg, Lemon Rice → peanuts)
- [ ] Step 5: Grouped grocery categories with priority badges
- [ ] Final CTA: "Open Dashboard" links to `/app`
- [ ] Navigation: step dots, prev/next buttons work

## Dashboard Verification (`/app`)

### Login Flow
- [ ] BiteWise navbar with "B" logo renders
- [ ] "Continue with Swiggy" and "Try Sandbox Demo" buttons visible
- [ ] Click "Try Sandbox Demo" → authenticates → product switcher appears

### Demo Seed
- [ ] DemoControlBar renders with "Seed Demo Data" and "Reset Session" buttons
- [ ] DemoStoryBanner shows contextual hint below control bar
- [ ] Click "Seed Demo Data" → success alert → profile and addresses populate

### NutriOrder AI Flow
- [ ] Product switcher: NutriOrder AI card is active (green border)
- [ ] Address dropdown populates with demo addresses
- [ ] Select address → session starts
- [ ] Search "high protein lunch" → recommendations load with score/macros
- [ ] Select top recommendation → cart preview renders
- [ ] Coupons section loads
- [ ] Confirm checkbox → "Place Order (COD)" button activates
- [ ] Place order → tracking steps animate → feedback modal appears
- [ ] Submit feedback → success alert (no raw alert() popup)

### SmartPantry AI Flow
- [ ] Product switcher: SmartPantry AI card switches (amber border)
- [ ] Low-stock alerts banner renders at top
- [ ] Cook Today panel shows recipe suggestions with coverage bars
- [ ] Household members card shows 3 members
- [ ] Nutrition insights card shows combined targets and allergens
- [ ] Pantry manager lists seeded items with stock levels
- [ ] Grocery list shows items with flat/grouped view toggle
- [ ] Cart preview panel renders estimated costs

### Error States
- [ ] All error messages appear as AlertBanner, **not** raw browser alert()
- [ ] Backend offline → landing page shows startup commands
- [ ] Empty states show helpful directional copy

---

## Test Suite

```bash
# Backend
.venv/bin/python run_tests.py
# Expected: 52 passed, 0 failed

# Frontend
cd frontend && npm run lint && npm run build
# Expected: 0 errors, compiled successfully, 4 routes
```

- [ ] Backend: 52 passed
- [ ] ESLint: 0 errors
- [ ] Build: compiled successfully

---

## Fallback Plan

If backend won't start:
1. Navigate to `/pitch`
2. Fallback mode auto-activates with "Preview Mode" badge
3. Walk through static sample data
4. All 5 steps render with representative data
5. Note: "This is a preview with sample data. The live demo uses real API calls."
