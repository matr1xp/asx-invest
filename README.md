# ASX Tracker

A personal dashboard for tracking ASX ETFs and shares — live prices, yield comparisons, portfolio performance, and income estimates.

## Features

- **Dashboard** — live prices and sparklines for 30 instruments across high-yield ETFs, growth ETFs, bonds, and cash funds, with category filtering
- **Detail view** — interactive price chart with 1D / 5D / 1M / 6M / 1Y / 5Y / All time ranges, plus cash yield, gross yield, MER, and franking details
- **Portfolio** — track holdings by dollar amount invested; auto-fills the historical buy price from the purchase date; shows live value, gain/loss, and estimated annual income
- **Yields & Income** — side-by-side yield comparison table with a built-in income calculator for estimating after-tax income based on investment amount, yield, and marginal tax rate

Prices are sourced from Yahoo Finance and are approximately 15 minutes delayed.

## Tech stack

- React 18 + React Router + TanStack Query
- Vite (dev) / Node.js HTTP server (production)
- TypeScript throughout

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

### Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Production

```bash
npm run build:prod   # compiles TypeScript and bundles the frontend
npm start            # serves the app on port 5173
```

The `PORT` and `HOST` environment variables can be used to override the defaults:

```bash
PORT=8080 HOST=127.0.0.1 npm start
```

### Tests

```bash
npm test
```

### Type checking

```bash
npm run typecheck
```

## Project structure

```
src/
  features/
    dashboard/    # instrument grid and cards
    detail/       # price chart and instrument stats
    portfolio/    # holdings tracker
    yields/       # yield table and income calculator
  api/            # Yahoo Finance query hooks
  store/          # portfolio state (localStorage)
  lib/            # formatting and income calculation helpers
  data/           # instrument definitions
server/
  handlers.ts     # API route logic and caching
  middleware.ts   # Vite dev server adapter
  prod.ts         # standalone production server
  yahoo.ts        # Yahoo Finance API client
  cache.ts        # TTL cache
docs/
  2026-06-02-asx-tracker-design.md
  2026-06-02-asx-tracker-plan.md
```
