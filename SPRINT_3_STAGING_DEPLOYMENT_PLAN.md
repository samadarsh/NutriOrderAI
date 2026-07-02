# Sprint 3 Plan: Staging + Deployment Readiness

This sprint focuses on transitioning NutriOrder AI from a local mock-centric codebase to a staging-ready, cloud-deployable product that can seamlessly integrate real Swiggy credentials.

---

## Plan Overview

### 1. Environment & Config Hardening
* Introduce `.env.example` in root and `frontend/` folders.
* Extend `config/settings.py` to capture `DATABASE_URL`, `ENCRYPTION_KEY`, `APP_ENV`, and Swiggy Client credentials.

### 2. Staging Switch & Safety Locks
* Enforce Swiggy production and staging checkout safety caps (Rs 1000 limit, double order prevention, explicit user confirmation) if `USE_MOCK_MCP` is set to `false`.

### 3. Deployment Configurations
* Create `backend/Dockerfile` for simple deployments to Railway, Render, or Fly.io.
* Add dynamic `CORS_ALLOWED_ORIGINS` loading inside `backend/main.py`.

### 4. Postgres Migration Path
* Setup `POSTGRES_MIGRATION.md` outlining the DB migration pathway.
* Support auto-generating/updating columns on startup dynamically for both PostgreSQL and SQLite.

### 5. Swiggy OAuth Staging Integrations
* Integrate real PKCE Swiggy token exchange flows when `USE_MOCK_MCP=false` is active.
* Implement status validation endpoint.

### 6. Observability & Audit Logs
* Inject unique Request UUIDs (`X-Request-ID` header) into responses.
* Store durable `OrderEvent` audit logs in the database.

### 7. End-to-End Demo Script
* Deliver a `DEMO_GUIDE.md` highlighting step-by-step validation paths for demo account login, biometrics, address picking, searching, recommendations, cart validation, order placement, and satiety feedback loops.
