# Deployment

This repository should be deployed on Vercel, not GitHub Pages.

## Why Vercel

The app under `ui/` uses:
- Next.js App Router
- server actions
- API routes
- Supabase server-side access
- middleware

GitHub Pages only serves static files, so it cannot run this app correctly.

## Vercel Setup

1. Import the GitHub repository `wuho1993/medimagic` into Vercel.
2. Set the project Root Directory to `ui`.
3. Framework Preset should be `Next.js`.
4. Keep the default build command: `npm run build`.
5. Keep the default output setting managed by Vercel.

## Required Environment Variables

Add these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional fallback variables supported by this repo:

- `SUPABASE_URL`
- `SUPABASE_DB_HOST`
- `SUPABASE_DB_PORT`
- `SUPABASE_DB_NAME`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`

Recommended minimum production setup:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Important Notes

- Do not upload `.env.local`.
- Do not upload `supabase-credentials.txt`.
- The repository already ignores local secrets, build output, and local Supabase temp state.
- If CSP blocks anything in production, review `ui/next.config.ts`.

## Post-Deploy Check

After first deploy, verify:

1. Login page loads.
2. Supabase authentication works.
3. Admin, attendance, and payroll pages can load data.
4. File upload or document actions still work.
5. Server actions complete without body-size errors.