# ASX Real-Time ETF/Stock Tracker — Design Spec

**Date:** 2026-06-02
**Status:** Approved design, pending implementation plan
**Source of tickers:** `common/data/shared/reports/asx-investing-guide-2026.html`

## Goal

A modern single-page application that tracks the ASX ETFs and stocks listed in the
2026 ASX Investing Guide, showing near-real-time prices, interactive charts, a
personal watchlist/portfolio, and the guide's curated yield/franking data.

## Architecture

Single-process app: a Vite + React SPA whose dev server also hosts an API proxy
(via a Vite plugin / `configureServer` middleware). The proxy is the only
server-side piece — it exists to bypass CORS to Yahoo Finance and to cache
responses briefly so we do not hammer the upstream.

```
Browser SPA (React + Vite + TS, :5173)
   │  fetch /api/quotes, /api/history   (same origin — no CORS)
   ▼
Vite middleware proxy (Node, in the dev server)
   │  in-memory cache, ~60s TTL
   ▼
Yahoo Finance (query1.finance.yahoo.com)  — ASX tickers use the .AX suffix
```

Scope is dev-only: the proxy runs solely as Vite dev-server middleware (`npm run dev`).
No standalone production server is built. The proxy logic still lives in its own
module (`server/`) so it stays testable and could be reused later, but it is wired in
only through the Vite plugin.

### API endpoints (proxy)

- `GET /api/quotes?symbols=VHY.AX,CBA.AX,...`
  → `[{ symbol, price, prevClose, change, changePct, currency, volume, marketState }]`
  Backed by Yahoo's quote endpoint. Batch request for the whole board in one call.
- `GET /api/history?symbol=VHY.AX&range=1mo&interval=1d`
  → `{ symbol, candles: [{ t, o, h, l, c, v }] }`
  Backed by Yahoo's chart endpoint. Drives the detail chart and the sparklines
  (sparklines use a small range, e.g. `5d`/`1d`).

Caching: in-memory `Map` keyed by request, ~60s TTL for quotes, longer (e.g. 5–15min)
for history. Prices are ~15-min delayed (Yahoo free data) — acceptable and labelled
in the UI.

## Data model

Static, curated instrument list seeded from the guide — the source of truth for
yield/franking/MER. Live price fields are merged at runtime.

```ts
type Category = 'high-yield-etf' | 'growth-etf' | 'bond-etf' | 'blue-chip' | 'a-reit';

interface Instrument {
  symbol: string;        // e.g. 'VHY' (Yahoo symbol = `${symbol}.AX`)
  name: string;          // 'Vanguard Aust. High Yield'
  category: Category;
  cashYield?: number;    // % — from guide
  grossYield?: number;   // % — franked, from guide
  mer?: number;          // % p.a. — from guide
  franking?: string;     // 'Fully' | 'Partial' | 'Unfranked'
  focus?: string;        // short descriptor
}

interface Quote {        // runtime, from proxy
  symbol: string; price: number; prevClose: number;
  change: number; changePct: number; volume: number; marketState: string;
}
```

### Instrument seed (from the guide)

- **High-yield ETFs:** VHY, A200, MVW, DGRO, SYI, VAP
- **Growth & diversified ETFs:** VAS, VGS, VDHG, ACDC, ESGI
- **Bond / cash ETFs:** AGVT, VAF, IAF, AAA, RCB
- **Blue-chip shares:** CBA, NAB, ANZ, WBC, BHP, WES, WOW, TLS
- **A-REITs:** GMG, SCG, CHC, DXS, MGR, CQR

(VAP appears under both ETFs and A-REITs in the guide; it is listed once as a
high-yield/property ETF.)

The growth & diversified ETFs are user additions, not from the guide:
VAS (broad ASX 300), VGS (global developed markets), VDHG (multi-asset high growth),
ACDC (battery tech / lithium thematic), ESGI (international sustainable equity). They
are seeded with issuer MERs (VAS 0.07%, VGS 0.18%, VDHG 0.27%, ACDC 0.69%, ESGI 0.55%);
`cashYield`/`franking` are left optional and populated at implementation where a
reliable figure is available, otherwise shown as "—".

## Features

1. **Dashboard** — instrument cards grouped by category. Each card: name, symbol,
   live price, day change % (green/red), and a sparkline. Sortable (by change %,
   yield, name) and filterable by category. Auto-refresh every **5 minutes** with a
   "last updated HH:MM" indicator and a manual refresh button.
2. **Detail view** — selecting a card opens an interactive chart (lightweight-charts)
   with range selector 1D / 5D / 1M / 6M / 1Y, volume, and a stats sidebar showing
   the guide's yield, gross yield, MER, franking, and focus.
3. **Watchlist / portfolio** — user adds holdings (`symbol`, units, buy price).
   Shows live market value, unrealised gain/loss ($ and %), and projected annual
   income (units × price × cashYield). Persisted in `localStorage`.
4. **Yield & income view** — table of all instruments with guide yield/franking/MER
   beside live price, plus the income calculator ported from the guide (amount,
   strategy, marginal tax rate, holding period → estimated income incl. franking).

## Tech choices

- **React + Vite + TypeScript** SPA.
- **TanStack Query** for data fetching, caching, 5-min polling, loading/error states.
- **Charts:** Recharts for sparklines and portfolio visuals; **lightweight-charts**
  (TradingView) for the detail chart.
- **Routing:** React Router (`/`, `/instrument/:symbol`, `/portfolio`, `/yields`).
- **Styling:** reuse the guide's palette (navy `#0A1628`, gold `#F5A623`,
  teal `#00C9A7`) and fonts (Inter, JetBrains Mono) for visual continuity. Plain
  CSS modules or a light utility setup — no heavy UI framework.

## Module boundaries

- `server/yahoo.ts` — pure functions: build Yahoo URLs, fetch, normalise to `Quote` /
  candle shapes. No Express/Vite coupling.
- `server/cache.ts` — generic TTL cache.
- `server/middleware.ts` — wires endpoints to `yahoo.ts` + `cache.ts`; consumed by the
  Vite dev-server plugin.
- `src/data/instruments.ts` — static seed.
- `src/api/` — typed client wrappers + TanStack Query hooks (`useQuotes`, `useHistory`).
- `src/features/dashboard`, `src/features/detail`, `src/features/portfolio`,
  `src/features/yields` — one folder per view, each independently understandable.
- `src/store/portfolio.ts` — localStorage-backed portfolio state.

Each unit has one purpose, a typed interface, and can be tested without the others.

## Error handling

- Proxy: upstream failure → `502` with a JSON error; never crash the dev server.
- Client: if quotes fail or a symbol returns no data, the card/row falls back to the
  static guide data with a "price unavailable" badge rather than breaking the view.
- History fetch failure → chart shows an inline retry, dashboard sparkline degrades
  to a flat placeholder.
- Empty portfolio → friendly empty state with an "add holding" prompt.

## Testing

- **Unit (Vitest):** `yahoo.ts` normalisation (mock Yahoo payloads), `cache.ts` TTL
  behaviour, portfolio math (value, gain/loss, income), the income calculator.
- **Component (Testing Library):** dashboard card renders gain/loss colours; portfolio
  form adds/persists a holding; yields table merges static + live data.
- **Manual smoke:** run `npm run dev`, confirm live prices load for the real tickers.

## Out of scope (YAGNI)

- User accounts / auth, multi-device sync (localStorage only).
- True real-time streaming/websockets (5-min polling of delayed data is enough).
- Trading or broker integration.
- Currencies other than AUD.

## Notes / constraints

- Prices are ~15-min delayed (Yahoo free tier); the UI labels this. Outside ASX
  trading hours, `marketState` is shown (e.g. "Closed").
- Yahoo's endpoints are unofficial; the proxy isolates that dependency so it can be
  swapped (e.g. for a paid feed) without touching the SPA.
- Project lives in `asx-invest/`. The repo is not under git; no commits will be made
  unless explicitly requested.
