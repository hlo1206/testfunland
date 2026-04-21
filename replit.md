# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## FunLand MC

Public Minecraft store + admin panel for the FunLand MC server.

### Artifacts
- `artifacts/funland-mc` (web) — public site (Home, Store, Checkout, Admin). **Talks to Supabase directly.** No backend needed for production.
- `artifacts/api-server` — legacy Express backend, no longer used by the frontend. Can be ignored for the Vercel deploy.

### Backend: Supabase
Project: `gncywtnrplxhjjtdoclo.supabase.co`. Schema lives in Supabase Postgres (`products`, `orders`, `server_status`). Storage bucket `payment-proofs` (public read). RLS policies allow:
- anyone: read products/server_status, insert orders, upload payment proofs
- authenticated (admin): read/update orders, update server_status

Frontend client at `artifacts/funland-mc/src/lib/supabase.ts` exposes typed React Query hooks (`useListProducts`, `useGetServerStatus`, `useCreateOrder`, etc.) plus `uploadPaymentProof`.

### Admin access
Sign in at `/admin` with username `prideisnub` and password `nubispride`. Under the hood this calls `supabase.auth.signInWithPassword` using the email `prideisnub@funland.local`.

### Vercel deployment
1. Set Vercel project root directory to `artifacts/funland-mc`.
2. `vercel.json` is already set up — it builds from the monorepo root and outputs `dist/public`.
3. Add env vars in Vercel: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (values currently in `artifacts/funland-mc/.env`).
4. SPA routing handled via the `rewrites` rule in `vercel.json`.

### Important details
- UPI ID for website payments: `9155174642@pthdfc`
- Discord: `https://discord.gg/gPSDTxqYWn`
- Server: `play.funlandmc.fun:19132`, versions 1.16+ to 1.21.11
- Order statuses: `pending → verified → delivered` (or `rejected`).
