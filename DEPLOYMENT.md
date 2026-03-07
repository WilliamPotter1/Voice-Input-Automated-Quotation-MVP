# Deploying on Vercel

## Fixing "Route POST:/ not found" (backend path on Vercel)

If login or other API calls return `{"message":"Route POST:/ not found",...}`, the backend is receiving path `/` instead of e.g. `/api/auth/login`. The repo fixes this with a **Vercel serverless catch-all**:

- **Backend** has `api/[[...path]].ts`, which handles every `/api/*` request and forwards it to the Fastify app with the **correct path** via `inject()`.
- Ensure the **backend** project on Vercel uses this setup:
  - **Root Directory:** `backend` (if the repo is a monorepo).
  - **Framework Preset:** **Other** (so Vercel does not run the root Fastify server; only the `api/` serverless functions run).
  - **Build Command:** `npm run build` (creates `dist/app.js` for the handler).
  - **Install Command:** `npm install`.

After redeploying the backend, `POST /api/auth/login` and all other `/api/*` routes should work.

---

## Fixing "Cannot reach server" (Vercel)

This error means the browser could not get a response from the backend (wrong URL or CORS). Do **both** steps below.

---

## 1. Frontend: set backend URL at build time

The frontend must know the backend URL **when it is built**. On Vercel, that means an environment variable.

1. Open **Vercel** → your **frontend** project (not the backend).
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://voice-input-automated-quotation-mvp-vert.vercel.app`  
     (no trailing slash; use your real backend URL if different)
   - **Environment:** tick Production (and Preview if you use preview deploys).
4. **Redeploy** the frontend (Deployments → ⋮ → Redeploy).  
   Without a new deploy, the build won’t see the variable and will still use `/api` (same origin).

---

## 2. Backend: allow the frontend origin (CORS)

The backend must allow requests from the frontend’s domain.

1. Open **Vercel** → your **backend** project.
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - **Name:** `CORS_ORIGIN`
   - **Value:** your frontend URL, e.g. `https://your-frontend.vercel.app`  
     (no trailing slash; the URL you use to open the app in the browser)
   - **Environment:** Production (and Preview if needed).
4. **Redeploy** the backend.

---

## 3. Check the backend

In a browser tab, open:

`https://voice-input-automated-quotation-mvp-vert.vercel.app/api/health`

You should see something like: `{"status":"ok","timestamp":"..."}`.

- If that **fails** or times out, the backend isn’t reachable (deploy or URL problem).
- If it **works**, the backend is up; then the issue was frontend URL (step 1) or CORS (step 2). After fixing both and redeploying, try signing in again.
