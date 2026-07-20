# ShellQuest

Learn Linux by typing real commands — a browser terminal, AI chat, AI-generated
quizzes, and a new daily task, with progress saved per user.

## Structure

```
shellquest/
├── frontend/   React + Vite + Tailwind + Clerk
└── backend/    Node + Express + TypeScript + Socket.io + node-pty
```

## 1. Prerequisites

- Node.js 18+
- A Clerk account (https://clerk.com) — free tier is enough
- A PostgreSQL database (AWS RDS for production, or local Postgres for dev)
- A Groq API key

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# fill in CLERK_SECRET_KEY and AI_API_KEY (Groq) if needed
npm install
```

For local development, `DATABASE_URL` defaults to the Postgres container
defined in `docker-compose.yml`:

`postgresql://shellquest:shellquest@localhost:5432/shellquest`

Create the tables (run once against your Postgres DB):

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

Run the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:4000`.

> Note: `node-pty` compiles a native module. On Linux/macOS this works out of
> the box with build tools installed (`build-essential` on Ubuntu). On
> Windows, use WSL for the terminal feature to work reliably.

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# fill in VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` and `/socket.io`
to the backend.

## 4. Clerk setup (quick)

1. Create an application at https://dashboard.clerk.com
2. Enable Email and/or Google/GitHub sign-in
3. Copy the **Publishable key** → `frontend/.env` as `VITE_CLERK_PUBLISHABLE_KEY`
4. Copy the **Secret key** → `backend/.env` as `CLERK_SECRET_KEY`

## 5. How auth flows through the app

- Frontend uses `@clerk/clerk-react` — login/signup UI is entirely handled by Clerk
- Every API call attaches the Clerk session token as `Authorization: Bearer <token>`
- Backend's `verifyClerkAuth` middleware verifies that token and extracts the
  Clerk `userId`, which is used as the key for all database rows (no
  separate password/user table needed — Clerk owns identity, our DB only
  owns app data: quiz results, task progress, badges)

## 6. What's a placeholder vs. real

Real and working once you add your keys:
- Clerk login/signup, protected `/dashboard` route
- Express API routes + Postgres queries (schema included)
- Live terminal over Socket.io + node-pty
- AI chat + AI quiz generation (Gemini by default, OpenAI supported)
- Badge unlock logic (first task, 5 tasks, perfect quiz)

Left as a hook to extend (called out in code comments):
- `terminalHandler.ts`'s `looksLikeTaskDone()` — automatic detection of
  whether a daily task was solved just by watching terminal output is left
  as a simple heuristic. The "Daily Task" tab currently marks a task
  complete when the frontend calls `POST /api/daily-task/complete`
  directly; wire this up to a real check (e.g. run the task's
  `verifyCommand` and inspect the result) when you get to that step.

## 7. Suggested build order (matches the 4-day plan)

1. **Day 1** — Clerk login, Home Page, Dashboard shell (tabs, no data yet)
2. **Day 2** — Terminal (node-pty + xterm.js) + Daily Task tab
3. **Day 3** — AI Chat + Quiz (AI generate) + DB save/fetch
4. **Day 4** — Badges tab + deploy to AWS EC2 + testing .
