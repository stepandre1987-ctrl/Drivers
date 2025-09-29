# ViaPersona Drivers App (Next.js 14 + NextAuth + Prisma + Google Sheets)

## Local dev
1. Create `.env.local` from `.env.example`.
2. Use a Postgres (e.g., Neon). Set `DATABASE_URL`.
3. `npm i`
4. `npx prisma generate && npx prisma migrate dev`
5. `npm run dev`

## Render deploy (Docker)
- Connect GitHub repo and deploy as Web Service (Dockerfile auto-detected).
- Start command: `sh -c "npx prisma migrate deploy && npm start"`
- Env vars (Dashboard → Environment):
  - NODE_VERSION=18
  - TZ=Europe/Prague
  - NEXTAUTH_URL=https://your-app.onrender.com
  - NEXTAUTH_SECRET=... (random strong)
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - GOOGLE_SHEETS_ID
  - GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 (whole SA JSON encoded base64)
  - ADMIN_EMAILS=step.andre@seznam.cz,boss2@...,boss3@...
  - ACCOUNTANT_EMAILS=ucetni@...
  - DATABASE_URL=postgres://...

## Roles & privacy
- DRIVER: sees only own shifts & availability.
- ADMIN (Boss): full access incl. /admin.
- ACCOUNTANT: read-only /admin.
