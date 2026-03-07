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

Runs via `vercel dev` (local). API: health, auth (register/login), transcribe, extract-quote-items, quotes CRUD. For production, deploy to Vercel (see DEPLOYMENT.md).

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
cd backend && npm install && cd ../frontend && npm install
npm run dev          # backend (vercel dev) + frontend (vite)
npm run build        # backend then frontend
```

## Environment

**Backend** (`.env` in `backend/`, or Vercel env vars in production)

| Variable         | Description |
|------------------|-------------|
| `DATABASE_URL`   | MongoDB connection string |
| `OPENAI_API_KEY` | OpenAI API key (Whisper + GPT) |
| `JWT_SECRET`     | Secret for JWT (strong value in prod) |
| `CORS_ORIGIN`    | Frontend origin (optional; empty = allow all) |

**Frontend** (optional `.env` in `frontend/`)

| Variable        | Description                    |
|----------------|---------------------------------|
| `VITE_API_URL` | Deployed backend URL (no trailing slash). Leave empty in dev (uses proxy). Set in production so the app calls your deployed API, e.g. `https://your-backend.vercel.app`. |

### Deploying to Vercel

See **DEPLOYMENT.md** for step-by-step backend and frontend deployment. Backend uses Vercel’s Fastify support (`src/index.ts`); set `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, and optionally `CORS_ORIGIN` in the backend project. For MongoDB Atlas, allow access from anywhere (0.0.0.0/0) so Vercel can connect.

## Project layout

```
├── backend/          # Fastify API (Vercel Fastify entrypoint: src/index.ts)
│   ├── prisma/
│   ├── src/          # build-app, routes, services, plugins
│   └── vercel.json
├── frontend/         # Vite + React app
│   └── src/
├── DEPLOYMENT.md     # Vercel deploy steps
├── package.json      # Root scripts (concurrently)
└── README.md
```

## License

Proprietary. Full ownership to client after completion.
