# NutriOrder AI - Production Architecture

This document describes the multi-user production architecture of NutriOrder AI, highlighting the boundaries between the Streamlit MCP Staging Lab and the Production SaaS system.

---

## 🔀 Environment Boundaries

```
                         ┌──────────────────────────────────┐
                         │      NutriOrder AI Project       │
                         └────────────────┬─────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
      Streamlit "MCP Lab" [Local]                    Production Web App [FastAPI/Next.js]
 ┌──────────────────────────────────┐             ┌───────────────────────────────────┐
 │ - Local mock / staging sandbox   │             │ - Production-grade multi-tenant   │
 │ - Simple single-user memory      │             │ - Backend-owned Swiggy OAuth      │
 │ - Token entered via sidebar      │             │ - Encrypted DB tokens (AES-GCM)   │
 │ - Form-heavy developer dashboard │             │ - Strict Order State Machine      │
 └──────────────────────────────────┘             └───────────────────────────────────┘
```

---

## 🔑 1. Per-User OAuth 2.1 with PKCE

In the Streamlit MCP Lab, authorization relies on pasting a temporary token manually. In production:

* **Authorization Flow**: Initiated at `/auth/swiggy/start`, generating a cryptographically secure `code_verifier` and `code_challenge`.
* **State & Code Exchange**: The backend stores the `code_verifier` in HTTP-only secure cookie session state. When the Swiggy portal redirects to `/auth/swiggy/callback`, the backend exchanges the authorization code for the 5-day access token.
* **Encryption At Rest**: Tokens are encrypted using **AES-256-GCM** via the `ENCRYPTION_KEY` environment variable before being persisted to the database. Tokens are never exposed to the client-side frontend or logged in plaintext.

---

## 📍 2. Address Picker

To prevent arbitrary search results:

* **Address Selection**: Resolving saved addresses via `get_addresses` is a mandatory first-class step.
* **No Defaulting**: The user must select a specific `addressId` before the recommendation agent executes any food queries.
* **Pipeline Propagation**: The resolved `addressId` is carried through all stages of candidate generation (`search_menu`), cart building (`update_food_cart`), and checkout.

---

## 🚦 3. Order Safety State Machine

To enforce strict compliance with Swiggy Builders Club sandboxes, checkout sessions flow through a strict state machine:

```
[START] ──► [ADDRESS_SELECTED] ──► [SEARCHING] ──► [RECOMMENDATIONS_READY]
                                                          │
                                                          ▼
[USER_CONFIRMED] ◄── [CART_REVIEW_READY] ◄── [CART_UPDATED] ◄── [ITEM_SELECTED]
       │
       ▼
[ORDER_PLACING] ──► [ORDER_PLACED] ──► [TRACKING]
```

### Safety Rules:
1. **Explicit Confirmation**: Order placement is impossible without a transition to `USER_CONFIRMED` showing the exact final cart items and delivery address.
2. **Total Cost Check**: The session is immediately flagged as `FAILED` if the cart total exceeds **₹1,000**.
3. **Idempotency Protection**: On timeout or 5xx response post-placement, the state machine enters a pending verification state, invoking `get_food_orders` to check for active orders prior to triggering any duplicate retry.
4. **COD Restraints**: Payment method is locked to Cash On Delivery (`"COD"`), matching current staging sandbox limits.

---

## 👤 4. Per-User Memory

* **Database Persistence**: User memory profiles (goals, target protein, typical budget, allergies, and dislikes) are migrated from local JSON files to the PostgreSQL `user_profiles` table.
* **Isolation**: All database queries are scoped to the user session id (`user_id`), ensuring data from User A never impacts recommendations for User B.
