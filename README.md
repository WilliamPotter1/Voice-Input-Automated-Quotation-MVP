# Voice-Based Quote Generator (MVP)

Web SaaS to create quotes from voice input: record or upload audio → speech-to-text → AI quote extraction → editable quote form → save/list quotes → (M3: PDF, email/WhatsApp).

## Stack

- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4, TanStack Query 5, Zustand 5, React Router, Lucide, react-hot-toast
- **Backend:** Node.js 20, TypeScript, Fastify 5, Prisma 6 (MongoDB), Zod, OpenAI (Whisper + GPT-4o-mini), JWT auth

## Milestones

**Milestone 1**
- Project setup, voice recording / audio upload, speech-to-text (Whisper)

**Milestone 2 (current)**
- LLM extraction of quote items (items, quantities, prices) from transcribed text
- Editable quote form: add/remove items, quantity, unit price; configurable VAT rate
- Automatic calculations: line total, subtotal, VAT, total
- User auth (register, login, JWT); quote CRUD (create, list, get, update, delete)

## Quick start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- OpenAI API key (Whisper + GPT for extraction)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL (MongoDB URI), OPENAI_API_KEY, JWT_SECRET

npm install
npx prisma generate
npx prisma db push
npm run dev
```

Runs at `http://localhost:3001`. API: health, auth (register/login), transcribe, extract-quote-items, quotes CRUD.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173` and proxies `/api` to the backend.

### Monorepo scripts (from repo root)

```bash
npm install
npm run dev          # backend + frontend
npm run build        # both
```

## Environment

**Backend** (`.env` in `backend/`)

| Variable        | Description                    |
|----------------|---------------------------------|
| `PORT`         | Backend port (default 3001)     |
| `DATABASE_URL` | MongoDB connection string       |
| `OPENAI_API_KEY` | OpenAI API key (Whisper + GPT) |
| `JWT_SECRET`   | Secret for JWT (strong value in prod) |

**Frontend** (optional `.env` in `frontend/`)

| Variable        | Description                    |
|----------------|---------------------------------|
| `VITE_API_URL` | Deployed backend URL (no trailing slash). Leave empty in dev (uses proxy). Set in production so the app calls your deployed API, e.g. `https://your-backend.vercel.app`. |

### Deploying backend to Vercel (fixing login 500)

If the frontend gets "internal server error" on login, the backend is returning 500. Set these in the **backend** project on Vercel (Settings → Environment Variables):

- **DATABASE_URL** – Your MongoDB connection string (e.g. Atlas). Required.
- **JWT_SECRET** – A long random string. Required for auth.
- **OPENAI_API_KEY** – For Whisper and quote extraction.
- **CORS_ORIGIN** (optional) – Your frontend URL, e.g. `https://your-frontend.vercel.app`. If empty, all origins are allowed.

If using **MongoDB Atlas**: in Atlas → Network Access, add **0.0.0.0/0** (Allow access from anywhere) so Vercel’s serverless functions can connect. You can restrict to Vercel IPs later if needed.

After changing env vars, redeploy the backend. Check the backend’s **Vercel → Deployments → Function logs** for the real error if it still fails.

## Project layout

```
├── backend/          # Fastify API, Prisma (MongoDB), Whisper, GPT extraction, JWT auth
│   ├── prisma/
│   └── src/
├── frontend/         # Vite + React app
│   └── src/
├── package.json      # Root scripts (concurrently)
└── README.md
```

## License

Proprietary. Full ownership to client after completion.
