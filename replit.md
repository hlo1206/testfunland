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
- `artifacts/funland-mc` (web, base `/`) — public site (Home, Store, Checkout, Admin)
- `artifacts/api-server` (api, base `/api`) — Express + Drizzle backend

### Admin access
Set the `ADMIN_EMAILS` env var on the api-server to a comma-separated list of admin emails. After signing in via Replit Auth with an email in this list, the user gets `isAdmin = true` and access to `/admin`.

### Important details
- UPI ID for website payments: `9155174642@pthdfc`
- Discord: `https://discord.gg/gPSDTxqYWn`
- Server: `play.funlandmc.fun:19132`, versions 1.16+ to 1.21.11
- Products are seeded directly in the database (`products` table). To re-seed, run the seed SQL in `lib/db/src/schema/funland.ts` notes.
- Payment proofs upload via presigned URL flow (`/api/storage/uploads/request-url`) and are stored in object storage.
- Order statuses: `pending → verified → delivered` (or `rejected`).
