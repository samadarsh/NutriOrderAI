# NutriOrder AI - Production Deployment & Hosting Guide

This guide details the step-by-step instructions to deploy NutriOrder AI (FastAPI backend and Next.js frontend) to hosting platforms like Render, Railway, or Fly.io.

---

## 1. Architecture Overview

```text
Frontend (Next.js)  --[ HTTPS requests with Cookies ]--> Backend (FastAPI)
         |                                                   |
         v                                                   v
  Static/Edge Hosting                                    Docker / App Container
 (Render/Vercel/Railway)                                  (Persistent SQLite Vol)
```

---

## 2. Backend Deployment (FastAPI)

You can deploy the backend using the root [Dockerfile](file:///Users/samadarsh/Documents/MY%20PROJECTS/nutriorderai/Dockerfile) on platforms like Railway or Render.

### Environment Variables
Configure the following parameters in your hosting provider's dashboard:
* `APP_ENV=production`
* `USE_MOCK_MCP=true` (Set to `false` only after staging credentials are configuration-checked)
* `ALLOW_PLACE_ORDER=false` (Keep false to lock live order checkouts)
* `DATABASE_URL=sqlite:////app/data/nutriorder.db` (Ensure database is stored on a persistent volume)
* `ENCRYPTION_KEY=your_32_byte_hex_encryption_key_here` (Do not change this key once entries are saved)
* `CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com` (Do not use `*` as credentials/cookies require explicit domains)

### Persistent Disk / Volume
SQLite database is local. To prevent data loss when backend containers restart, configure a **Persistent Volume**:
1. Mount Path: `/app/data`
2. Size: `1 GB` is plenty for logs and user targets.
3. Configure `DATABASE_URL=sqlite:////app/data/nutriorder.db` to point to the mounted folder.

---

## 3. Frontend Deployment (Next.js)

Deploy the frontend folder using the [frontend/Dockerfile](file:///Users/samadarsh/Documents/MY%20PROJECTS/nutriorderai/frontend/Dockerfile) Next.js server container.

### Build-Time Environment Variables
Next.js injects public environment variables at **build time**. Make sure to supply this parameter during the build process:
* `NEXT_PUBLIC_API_URL=https://your-backend-domain.com` (Build argument: `--build-arg NEXT_PUBLIC_API_URL=https://your-backend-domain.com`)

### Static Edge Hosting Alternatives
Alternatively, you can import the `frontend/` folder into Vercel. Ensure you set `NEXT_PUBLIC_API_URL` under Vercel Settings -> Environment Variables.

---

## 4. CORS, Cookies, and HTTPS Hardening

Because NutriOrder AI uses cookie-based authentication (`nutriorder_session`), strict cross-origin restrictions apply:

### 1. Credentials Support
* `CORS_ALLOWED_ORIGINS` on the backend **must** match your frontend domain exactly (e.g. `https://nutriorder-app.railway.app`).
* The backend CORS middleware has `allow_credentials=True` enabled by default to allow browser cookie transmissions.

### 2. HTTPS Requirements
* Browsers block cross-site cookies unless they are served over **HTTPS**.
* Ensure both your frontend and backend run on HTTPS.

### 3. SameSite Cookie Attributes
* If the frontend and backend are hosted on **different root domains** (e.g. `nutriorder-ui.vercel.app` and `nutriorder-api.railway.app`):
  * The session cookie must have `samesite="none"` and `secure=True`.
* If they share the **same parent domain** (e.g. `app.nutriorder.com` and `api.nutriorder.com`):
  * Set `samesite="lax"` or `samesite="strict"` with `secure=True`.
* Update cookie attributes inside [backend/auth/swiggy_oauth.py](file:///Users/samadarsh/Documents/MY%20PROJECTS/nutriorderai/backend/auth/swiggy_oauth.py) and [backend/orders/routes.py](file:///Users/samadarsh/Documents/MY%20PROJECTS/nutriorderai/backend/orders/routes.py) accordingly before deploying.

---

## 5. Post-Deployment Verification
Once deployed:
1. Trigger the smoke test command pointing to your live backend domain:
   ```bash
   python scripts/smoke_test.py https://your-backend-domain.com --mode staging
   ```
2. Confirm the unauthenticated checks pass without errors.
