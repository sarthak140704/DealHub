# DealHub

A full-stack deals marketplace where **vendors** submit deals, **admins** approve/moderate them, and **customers** browse, bookmark, and review. Built with the Next.js App Router, end-to-end type-safe tRPC, and Prisma.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **tRPC 11** with **TanStack Query** for type-safe client/server data flow
- **Prisma 7** ORM on **PostgreSQL** (via `@prisma/adapter-pg`)
- **JWT** session auth (`jose`) with `httpOnly` cookies + edge middleware route protection
- **Tailwind CSS 4**
- **Bun** as the package manager / runtime

## Roles

| Role | Can |
|------|-----|
| `CUSTOMER` | Browse & search active deals, bookmark, review, manage notifications/profile |
| `VENDOR` | Submit deals (go to `PENDING_APPROVAL`), edit/delete own deals, view analytics |
| `ADMIN` | Approve/reject deals, manage users & categories, view audit logs |

Route protection is enforced in `src/middleware.ts` (redirects) and again per-procedure in `src/app/trpc/init.ts` (`protectedProcedure` / `vendorProcedure` / `adminProcedure`).

## Getting started

### 1. Prerequisites

- [Bun](https://bun.sh) (1.3+)
- A PostgreSQL database

### 2. Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Secret used to sign session JWTs. **Required in production** — the app throws on startup if unset when `NODE_ENV=production`. |

### 3. Install, migrate, seed

```bash
bun install                 # installs deps and generates the Prisma client (postinstall)
bunx prisma migrate deploy  # apply migrations (or: bunx prisma migrate dev)
bun prisma/seed.ts          # seed demo data (optional)
```

### 4. Run

```bash
bun run dev     # development
# or
bun run build && bun run start   # production build + serve
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

After seeding, all accounts share the password `password123`:

| Role | Email |
|------|-------|
| Admin | `admin@dealhub.com` |
| Vendor | `vendor1@dealhub.com`, `vendor2@dealhub.com` |
| Customer | `john@example.com`, `jane@example.com` |

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run lint` | Run ESLint |
| `bunx tsc --noEmit` | Type-check |

## Project structure

```
src/
  app/
    (admin)/ (customer)/ (vendor)/   # role-scoped route groups
    api/trpc/[trpc]/route.ts         # tRPC HTTP handler
    trpc/                            # tRPC init, client/server helpers, routers
  components/                        # shared UI (DealCard, Sidebar, ThemeProvider, ...)
  lib/                               # auth (JWT/bcrypt) and Prisma client
  middleware.ts                      # auth + role-based route protection
prisma/
  schema.prisma                      # data model
  migrations/                        # SQL migrations
  seed.ts                            # demo data
```
