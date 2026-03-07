# Deploying to Vercel (backend + frontend)

Use **two Vercel projects**: one for the backend, one for the frontend.

---

## Backend project

1. **Create or open the backend project** on Vercel and connect the repo.

2. **Root Directory**  
   Set to `backend` (if the repo has both `frontend/` and `backend/`).

3. **Build**
   - **Framework Preset:** **Other** (so Vercel uses the `api/` serverless handler; `vercel.json` sets `framework: null`).
   - **Node.js Version:** In **Settings → General → Node.js Version**, choose **20.x**.
   - **Build Command:** `npm run build` (creates `dist/` for the api handler).
   - **Install Command:** `npm install`.
   - **Output Directory:** `.` (set in `vercel.json`).

4. **Environment variables** (Settings → Environment Variables):
   - `DATABASE_URL` – MongoDB connection string (e.g. Atlas).
   - `JWT_SECRET` – Long random secret (e.g. `openssl rand -hex 32`).
   - `OPENAI_API_KEY` – For Whisper and quote extraction.
   - `CORS_ORIGIN` – Frontend URL, e.g. `https://your-frontend.vercel.app` (no trailing slash). Optional; if empty, all origins allowed.

5. **Deploy** and note the backend URL (e.g. `https://your-backend.vercel.app`).

6. **Check:** open the backend URL (root) for a short “Voice Quote API” page; open `https://your-backend.vercel.app/api/health` for `{"status":"ok",...}`.

---

## Frontend project

1. **Create or open the frontend project** on Vercel and connect the same repo.

2. **Root Directory**  
   Set to `frontend`.

3. **Build**
   - **Framework Preset:** **Vite** (or **Other**; `vercel.json` sets build and SPA rewrites).
   - **Build Command:** `npm run build`.
   - **Output Directory:** `dist`.

4. **Environment variables**
   - `VITE_API_URL` – Backend URL, e.g. `https://your-backend.vercel.app` (no trailing slash).  
   Set at build time; redeploy after changing.

5. **Deploy** and note the frontend URL.

6. **CORS:** In the **backend** project, set `CORS_ORIGIN` to this frontend URL and redeploy the backend if needed.

---

## After deploy

- **Frontend:** Open the frontend URL; login and API calls use the backend URL.
- **Backend:** `GET https://your-backend.vercel.app/api/health` should return OK.

**If you see "Cannot reach server"** – set `VITE_API_URL` on the frontend and `CORS_ORIGIN` on the backend, then redeploy both.
