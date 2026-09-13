# KPMA Dashboard

Personal client & payment dashboard for **Kissanthan Performance Marketing
Agency** — tracks which clients have paid (by service category) each month,
plus a separately password-protected payroll dashboard for worker salaries.

Built with Next.js (App Router), Prisma, and Postgres. Designed to be
installed to a phone home screen as a standalone app (PWA) and deployed on
Vercel with a Neon Postgres database.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start a local Postgres-compatible database (no Docker required — Prisma
   runs one for you):

   ```bash
   npm run db:local
   ```

   This prints a connection string. Copy `.env.example` to `.env` and set
   `DATABASE_URL` to that connection string.

3. Generate a session secret and the two dashboard logins:

   ```bash
   openssl rand -hex 32
   npm run auth:generate main
   npm run auth:generate worker
   ```

   Put the secret in `SESSION_SECRET`. Each `auth:generate` run prints a
   `*_AUTH_PASS_HASH="..."` line — paste it into `.env` exactly as shown
   (the `\$` escaping is required, or Next.js's own `.env` variable
   expansion will corrupt the hash), and set `MAIN_AUTH_USER` /
   `WORKER_AUTH_USER` to the printed username. **Write down the plaintext
   passwords printed in the terminal — they are never stored anywhere.**

4. Push the schema and load demo data:

   ```bash
   npm run db:push
   npm run db:seed
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` — it redirects to `/login` for the main
   dashboard. The worker/payroll dashboard lives at `/workers` with its own
   `/workers/login`.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Create a free [Neon](https://neon.tech) Postgres database and copy its
   pooled connection string.
3. Import the repo into [Vercel](https://vercel.com/new).
4. In the Vercel project's Environment Variables, set:
   - `DATABASE_URL` — the Neon connection string
   - `SESSION_SECRET` — output of `openssl rand -hex 32`
   - `MAIN_AUTH_USER`, `MAIN_AUTH_PASS_HASH`
   - `WORKER_AUTH_USER`, `WORKER_AUTH_PASS_HASH`
5. After the first deploy, run the schema + seed against the Neon database
   once from your machine (point `DATABASE_URL` in `.env` at Neon
   temporarily, or use `vercel env pull`):

   ```bash
   npm run db:push
   npm run db:seed   # optional — only if you want the demo data in production too
   ```

Passwords are never stored in the source code — only bcrypt hashes live in
environment variables, both locally and in Vercel's project settings.

## Installing as a phone app

Once deployed, open the Vercel URL on your phone and use the browser's
"Add to Home Screen" option. The dashboard has a web app manifest and icons
configured, so it launches full-screen like a native app.

## Project structure

- `app/dashboard` — main client dashboard (protected by `/login`)
- `app/workers` — payroll dashboard (protected by its own `/workers/login`)
- `app/api` — route handlers (auth, clients, categories, payments, workers)
- `lib/` — auth, Prisma client, currency/date helpers, payment aggregation
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` — demo data (categories, clients, workers, payment history)

## Known dev-dependency advisories

`npm audit` flags a few high-severity issues inside the `prisma` CLI's own
bundled tooling (an experimental local-dev/MySQL code path we don't use —
this project only talks to Postgres). They affect the CLI at build/dev time
only, not the `@prisma/client` runtime code that ships to Vercel.
