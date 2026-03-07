# Deploying to Vercel (backend + frontend)

Use **two Vercel projects**: one for the backend, one for the frontend. Configure each as below so both run correctly after deploy.

---

## Backend project

1. **Create / open the backend project** on Vercel and connect the repo.

2. **Root Directory**  
   - If the repo contains both `frontend/` and `backend/`: set **Root Directory** to `backend`.  
   - If the repo is backend-only: leave Root Directory empty.

3. **Build & output**
   - **Framework Preset:** **Other** (do not use “Fastify” or a root server; the `api/` serverless handler must handle all traffic).
   - **Build Command:** `npm run build` (or leave default; `vercel.json` sets it).
   - **Install Command:** `npm install` (or leave default).
   - Do **not** set a Start Command.

4. **Environment variables** (Settings → Environment Variables):
   - `CORS_ORIGIN` = your frontend URL, e.g. `https://your-frontend.vercel.app` (no trailing slash).
   - `JWT_SECRET` = a long random secret (e.g. from `openssl rand -hex 32`).
   - `DATABASE_URL` = your MongoDB connection string.
   - `OPENAI_API_KEY` = your OpenAI API key.

5. **Deploy.** Note the backend URL (e.g. `https://your-backend.vercel.app`).

6. **Check:** open `https://your-backend.vercel.app/api/health` — you should see `{"status":"ok",...}`.

---

## Frontend project

1. **Create / open the frontend project** on Vercel and connect the same repo.

2. **Root Directory**  
   - If the repo contains both `frontend/` and `backend/`: set **Root Directory** to `frontend`.  
   - If the repo is frontend-only: leave Root Directory empty.

3. **Build & output**
   - **Framework Preset:** **Vite** (or **Other**; `frontend/vercel.json` sets build and SPA rewrites).
   - **Build Command:** `npm run build` (or leave default).
   - **Output Directory:** `dist` (or leave default; `vercel.json` sets it).

4. **Environment variables** (Settings → Environment Variables):
   - `VITE_API_URL` = your **backend** URL, e.g. `https://your-backend.vercel.app` (no trailing slash).  
   - This is baked in at **build time**; change it only in the dashboard and then **redeploy**.

5. **Deploy.** Note the frontend URL (e.g. `https://your-frontend.vercel.app`).

6. **CORS:** In the **backend** project, set `CORS_ORIGIN` to this frontend URL and redeploy the backend if you didn’t already.

---

## After deploy

- **Frontend:** open the frontend URL; you should see the app. Login/register and API calls go to the backend URL.
- **Backend:** `GET https://your-backend.vercel.app/api/health` should return OK.

If login returns **"Route POST:/ not found"**, the backend is not using the `api/` serverless handler: set **Framework Preset** to **Other** and ensure **Root Directory** is `backend`, then redeploy.

If you see **"Cannot reach server"**, set `VITE_API_URL` on the frontend and `CORS_ORIGIN` on the backend, then redeploy both.
