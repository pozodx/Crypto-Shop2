# CryptoStore

A digital goods storefront where sellers list products and buyers pay with Bitcoin or Ethereum — delivery happens automatically after on-chain payment confirmation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/shop run dev` — run the storefront frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (artifacts/api-server)
- Frontend: React + Vite + Tailwind (artifacts/shop)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Crypto rates: CoinGecko public API (5-min cache)
- BTC verification: Blockstream API
- ETH verification: Etherscan public API

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — DB tables: products, orders, settings
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/shop/src/` — React frontend (pages/, components/)

## Architecture decisions

- No external payment processor — uses raw wallet addresses; blockchain APIs verify payments
- Crypto rates fetched from CoinGecko with 5-minute in-memory cache to avoid rate limits
- Orders expire after 1 hour if payment not confirmed
- Digital content is stored in the DB and revealed only after payment confirmation
- Admin panel is open (no auth) — add authentication when going to production

## Product

- **Shop page**: list all active products with live USD + crypto pricing
- **Product detail**: full info and buy flow (email + crypto currency selection)
- **Order page**: wallet address + exact amount, countdown timer, verify button, auto-polls every 10s, reveals digital content on confirmation
- **Admin dashboard**: stats (revenue, order counts), recent orders
- **Admin products**: full CRUD — add/edit/delete products, set digital content for delivery
- **Admin orders**: all orders with status badges
- **Admin settings**: shop name, description, BTC/ETH wallet addresses

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, re-run codegen before touching the frontend
- ETH verification uses Etherscan free tier (replace `YourApiKeyToken` in orders.ts with a real key for production)
- BTC verification uses Blockstream (no key needed)
- Admin has no authentication — add it before going live with real products

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
