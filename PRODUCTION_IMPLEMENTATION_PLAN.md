# NutriOrder AI Production Implementation Plan

This plan separates the current Streamlit app from the production product. The
Streamlit app should remain a local/staging MCP lab. The production system should
be built as a proper multi-user web app with backend-owned OAuth, per-user
address selection, durable order state, and per-user memory.

## Current UI Assessment

The current Streamlit UI is useful for development and staging validation, but it
is not ideal for production.

Current limitations:

- Token entry happens in the sidebar instead of a real OAuth login flow.
- User memory is stored in local JSON, so it is effectively single-user.
- Address selection is not a first-class step.
- Session state is acceptable for demos but weak for reliable multi-user order
  workflows.
- The UI is form-heavy rather than a guided ordering assistant.
- There is no durable auth/session store, audit trail, profile database, or
  encrypted token storage.

Recommended role for Streamlit:

```text
Internal MCP sandbox / staging tester
```

Recommended role for production:

```text
Frontend: Next.js / React
Backend: FastAPI
Database: Postgres
Session/cache: Redis
Secure token storage: encrypted database fields or managed secrets
Agent layer: backend service using the existing ranking and MCP logic
```

## Target User Flow

```text
1. User opens NutriOrder AI
2. User clicks "Login with Swiggy"
3. User completes Swiggy OTP/OAuth
4. Backend stores the user session securely
5. Backend calls get_addresses
6. User selects a delivery address
7. User enters a goal, such as "high protein chicken under Rs 300"
8. Agent searches Swiggy using the selected addressId
9. App shows ranked meal options
10. User selects one option
11. Backend updates the food cart
12. Backend calls get_food_cart
13. User reviews items, total, payment method, and address
14. User explicitly confirms
15. Backend places the order
16. App tracks order status
```

## Phase 1: Freeze Streamlit As MCP Lab

Goal: keep the existing working app, but stop treating it as the production UI.

Tasks:

- Rename positioning in docs/UI from production app to `NutriOrder MCP Lab`.
- Keep current Python agent, ranking, mock MCP, staging MCP client, and tests.
- Add a README section that explains:
  - Streamlit is for local mock and staging validation.
  - The production app lives separately.
  - Production auth, memory, and order state will not be built inside Streamlit.
- Keep mock mode as the default.
- Do not call live Swiggy order placement from the lab unless staging safety flags
  are explicitly enabled.

## Phase 2: Create Production Architecture

Goal: add a production scaffold beside the Streamlit app without migrating
business logic yet.

Recommended directory shape:

```text
frontend/
backend/
agent/
db/
```

Recommended backend structure:

```text
backend/
  main.py
  auth/
    __init__.py
    swiggy_oauth.py
    sessions.py
  mcp/
    __init__.py
    swiggy_client.py
  users/
    __init__.py
    models.py
    routes.py
  orders/
    __init__.py
    state_machine.py
    routes.py
  recommendations/
    __init__.py
    service.py
  db/
    __init__.py
    models.py
    session.py
```

Recommended frontend structure:

```text
frontend/
  app/
  components/
  lib/
  package.json
```

Production stack:

- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui
- Backend: FastAPI
- Database: Postgres via SQLAlchemy or SQLModel
- Session/cache: Redis
- Token handling: encrypted token storage, never local JSON
- Deployment later: Vercel frontend plus Render/Fly/AWS backend, managed
  Postgres, and managed Redis

## Phase 3: Backend Core

Backend responsibilities:

- Handle Swiggy OAuth PKCE flow.
- Store each user's Swiggy access token securely.
- Treat 401 as re-auth required.
- Call Swiggy MCP tools.
- Store user profile and preferences.
- Own the order state machine.
- Enforce safety rules before calling `place_food_order`.
- Keep OAuth tokens out of frontend-accessible state.
- Never log tokens.

Initial backend routes:

```text
GET  /health
GET  /auth/swiggy/start
GET  /auth/swiggy/callback
POST /auth/logout
GET  /me
GET  /addresses
POST /addresses/select
GET  /profile
PUT  /profile
POST /recommendations/search
POST /orders/:session_id/select-item
POST /orders/:session_id/cart
GET  /orders/:session_id/cart
POST /orders/:session_id/confirm
POST /orders/:session_id/place
GET  /orders/:session_id/track
```

## Phase 4: Database Model

Minimum tables:

```text
users
- id
- swiggy_user_ref
- created_at

swiggy_tokens
- user_id
- encrypted_access_token
- expires_at
- scope
- created_at

user_profiles
- user_id
- protein_target
- calorie_target
- diet_preference
- allergies
- dislikes
- favorite_cuisines
- fitness_goal

delivery_addresses
- user_id
- address_id
- label
- display_text
- last_selected_at

order_sessions
- id
- user_id
- address_id
- status
- query
- selected_restaurant_id
- selected_item_id
- cart_snapshot
- total
- payment_method
- created_at
- updated_at

order_events
- order_session_id
- event_type
- payload
- created_at
```

Important data rules:

- Do not store raw coordinates.
- Do not store tokens in plaintext.
- Do not share memory/profile data across users.
- Store confirmation events before placement.
- Store cart snapshots before placement.

## Phase 5: Order State Machine

Strict states:

```text
START
AUTHENTICATED
ADDRESS_REQUIRED
ADDRESS_SELECTED
SEARCHING
RECOMMENDATIONS_READY
ITEM_SELECTED
CART_UPDATED
CART_REVIEW_REQUIRED
USER_CONFIRMED
ORDER_PLACING
ORDER_PLACED
TRACKING
FAILED
CANCELLED
```

Rules:

- Cannot search without `addressId`.
- Cannot update cart without a selected item and restaurant.
- Cannot place order without cart review.
- Cannot place order without explicit confirmation.
- Cannot place order if cart total is `>= Rs 1000`.
- Cannot blindly retry `place_food_order`.
- On timeout or 5xx after placement attempt, call `get_food_orders` before any
  retry.
- Always use `availablePaymentMethods` from `get_food_cart`.
- Only show payment methods actually returned by Swiggy.

## Phase 6: Frontend Product UI

Build screens around the actual ordering journey.

### Login Screen

- Primary action: `Continue with Swiggy`
- Short explanation that Swiggy login is required to access saved addresses and
  place orders.

### Address Picker

- Shows saved Swiggy addresses from `get_addresses`.
- User must select one address.
- Do not auto-pick silently.

### Nutrition Profile Setup

- Fitness goal
- Protein target
- Calorie target
- Diet preference
- Allergies
- Dislikes
- Favorite cuisines

### Order Assistant

- Prompt input, for example: `High protein chicken under Rs 300`
- Optional voice input later
- Shows detected constraints before searching

### Recommendation Results

- Ranked meal cards
- Restaurant
- Item
- Price
- ETA
- Protein estimate
- Match score
- Reasoning bullets
- User selects one option

### Cart Review

- Cart items
- Total
- Delivery address
- Payment method
- Safety warning if needed

### Confirmation

The final button must be explicit:

```text
Place COD Order on Swiggy
```

### Tracking

- Show order status.
- Poll no faster than every 10 seconds.
- Surface delivery ETA updates when available.

## Phase 7: Refactor Existing Python Logic

Move reusable logic out of Streamlit assumptions.

Keep:

- Ranking engine
- Nutrition scoring logic
- Swiggy MCP client
- Mock MCP client
- Resilience and non-idempotent order safety logic

Refactor:

- Memory should become database-backed.
- Pipeline should accept explicit user/session context:

```python
user_id
address_id
query
profile
token_context
```

Pipeline rules:

- The pipeline should not silently choose an address.
- The pipeline should not silently place an order.
- The pipeline should not update cart before the user selects a recommendation,
  unless that is an explicit product decision.

## Phase 8: Safety And Compliance

Backend guards:

- No production order unless production review is complete.
- Staging order only when `SWIGGY_ENV=staging`.
- Order placement only when an explicit allow flag is enabled.
- Hard block cart total `>= Rs 1000`.
- Log tool name, user/session id, status, latency, and error category.
- Never log OAuth tokens.
- Store cart snapshots before order placement.
- Store user confirmation event.
- Add rate limiting to mutating endpoints.
- Add idempotency protection around confirmation and placement endpoints.

## Phase 9: Tests

Add tests for:

- OAuth callback validation
- Per-user token separation
- Address selection required
- Recommendation cannot run without address
- Cart review required before placement
- `Rs 1000` cap
- Non-idempotent order recovery
- Token not logged
- User A cannot access user B order session
- Mock MCP and staging MCP response normalization
- State machine transition validation
- 401 triggers re-auth required

## Phase 10: Migration Path

Implement incrementally:

1. Create `backend/` with FastAPI health route.
2. Create `ARCHITECTURE.md`.
3. Add backend module structure.
4. Keep Streamlit untouched as the MCP lab.
5. Add DB models.
6. Add OAuth skeleton.
7. Add address picker endpoint.
8. Add recommendation endpoint using existing ranking.
9. Add cart review endpoint.
10. Add order placement endpoint with state machine.
11. Create `frontend/`.
12. Build production UI against backend.
13. Validate staging credentials.
14. Record demo flow.
15. Prepare production review checklist.

## First Implementation Prompt

Use this prompt to begin safely:

```text
Create a production-grade architecture beside the existing Streamlit app.

Do not delete the current Streamlit app. Treat it as an MCP staging lab.

Implement Phase 1 and Phase 2 only:
1. Add a clear docs update saying Streamlit is lab/staging only.
2. Create backend/ FastAPI scaffold with health route.
3. Create frontend/ Next.js scaffold if package tooling already exists, otherwise create a minimal documented placeholder.
4. Add backend module structure for auth, mcp, users, orders, recommendations, db.
5. Move no business logic yet, but add interface stubs and TODOs aligned with the production plan.
6. Add an ARCHITECTURE.md documenting:
   - per-user OAuth
   - address picker
   - session-level order state
   - per-user memory
   - order safety state machine
   - Streamlit lab vs production app boundary
7. Keep all existing tests passing.
8. Do not call live Swiggy MCP.
```

## Recommended Starting Point

Start with Phase 1 and Phase 2 only. This creates the correct boundary between
the lab app and the production app without forcing a risky half-migration.
