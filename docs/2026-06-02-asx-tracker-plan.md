# ASX Real-Time ETF/Stock Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React SPA that tracks 29 ASX ETFs/stocks with near-live prices, interactive charts, a localStorage portfolio, and the guide's yield data.

**Architecture:** A Vite + React + TypeScript SPA whose dev server hosts an API proxy as connect middleware. The proxy calls Yahoo Finance's v8 `chart` endpoint (no auth crumb required), normalises responses, and caches them in-memory. One chart fetch per symbol serves both the live quote and its sparkline.

**Tech Stack:** React 18, TypeScript, Vite, TanStack Query, React Router, Recharts (sparklines/portfolio), lightweight-charts (detail chart), Vitest + Testing Library.

---

## File Structure

```
asx-invest/
├── package.json, tsconfig.json, vite.config.ts, index.html
├── server/
│   ├── cache.ts            # generic TTL cache
│   ├── yahoo.ts            # fetch + normalise Yahoo v8 chart payloads
│   ├── middleware.ts       # /api/quotes, /api/history handlers
│   └── plugin.ts           # Vite plugin wiring middleware into dev server
├── src/
│   ├── main.tsx, App.tsx, index.css, theme.css
│   ├── types.ts            # shared Instrument/Quote/Candle types
│   ├── data/instruments.ts # static seed (29 tickers)
│   ├── api/client.ts       # fetch wrappers
│   ├── api/hooks.ts        # useQuotes / useHistory (TanStack Query)
│   ├── lib/format.ts       # number/currency/percent formatting
│   ├── lib/income.ts       # income-calculator math
│   ├── store/portfolio.ts  # localStorage-backed portfolio
│   ├── components/         # Sparkline, ChangeBadge, Layout/Nav
│   └── features/
│       ├── dashboard/Dashboard.tsx, InstrumentCard.tsx
│       ├── detail/Detail.tsx, PriceChart.tsx
│       ├── portfolio/Portfolio.tsx, HoldingForm.tsx
│       └── yields/Yields.tsx, IncomeCalculator.tsx
└── test setup: vitest.config.ts, src/test/setup.ts
```

Tests live next to the unit under test as `*.test.ts(x)`.

---

## Task 0: Scaffold project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "asx-invest",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -b --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "lightweight-charts": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd asx-invest && npm install`
Expected: `node_modules/` created, no error exit.

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "server"]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 5: Create `vite.config.ts`** (plugin wired in Task 3)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 7: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 8: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASX Tracker</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Create `src/index.css`** (theme tokens from the guide)

```css
:root {
  --gold: #F5A623; --navy: #0A1628; --navy-mid: #112240; --teal: #00C9A7;
  --red: #FF5A5F; --green: #27AE60; --bg: #0A1628; --card: #112240;
  --border: #1A3355; --text: #F7F8FA; --text-muted: #9CA3AF;
  --font: 'Inter', sans-serif; --mono: 'JetBrains Mono', monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); background: var(--bg); color: var(--text); }
a { color: inherit; text-decoration: none; }
```

- [ ] **Step 10: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchInterval: 5 * 60 * 1000, staleTime: 60 * 1000 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 11: Create placeholder `src/App.tsx`**

```tsx
export default function App() {
  return <div style={{ padding: 24 }}>ASX Tracker — scaffold OK</div>;
}
```

- [ ] **Step 12: Verify dev server boots**

Run: `cd asx-invest && timeout 8 npm run dev || true`
Expected: Vite prints `Local: http://localhost:5173/` with no compile error.

- [ ] **Step 13: Create `.gitignore` and commit**

```
node_modules
dist
.DS_Store
```

```bash
cd asx-invest
git add -A
git commit -m "chore: scaffold Vite React TS project"
```

---

## Task 1: TTL cache

**Files:**
- Create: `server/cache.ts`
- Test: `server/cache.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TtlCache } from './cache';

describe('TtlCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns a cached value before TTL expires', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('k', 42);
    expect(cache.get('k')).toBe(42);
  });

  it('returns undefined after TTL expires', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('k', 42);
    vi.advanceTimersByTime(1001);
    expect(cache.get('k')).toBeUndefined();
  });

  it('getOrFetch caches the resolved value', async () => {
    const cache = new TtlCache<number>(1000);
    const fetcher = vi.fn().mockResolvedValue(7);
    expect(await cache.getOrFetch('k', fetcher)).toBe(7);
    expect(await cache.getOrFetch('k', fetcher)).toBe(7);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run server/cache.test.ts`
Expected: FAIL — cannot find module `./cache`.

- [ ] **Step 3: Write minimal implementation**

```ts
// server/cache.ts
interface Entry<T> { value: T; expires: number; }

export class TtlCache<T> {
  private store = new Map<string, Entry<T>>();
  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expires) { this.store.delete(key); return undefined; }
    return e.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
  }

  async getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    const value = await fetcher();
    this.set(key, value);
    return value;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run server/cache.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd asx-invest && git add server/cache.ts server/cache.test.ts
git commit -m "feat: add TTL cache for proxy"
```

---

## Task 2: Yahoo fetch + normalise

**Files:**
- Create: `server/yahoo.ts`
- Test: `server/yahoo.test.ts`

Yahoo v8 chart URL: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range={range}&interval={interval}`. Response shape used here:
`json.chart.result[0].meta` → `{ regularMarketPrice, chartPreviousClose, previousClose, regularMarketVolume, currency, regularMarketTime, currentTradingPeriod }`; `result[0].timestamp` (number[]); `result[0].indicators.quote[0]` → `{ open[], high[], low[], close[], volume[] }`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { normaliseQuote, normaliseHistory, chartUrl } from './yahoo';

const sample = {
  chart: { result: [{
    meta: {
      regularMarketPrice: 70.5, chartPreviousClose: 70.0, previousClose: 70.0,
      regularMarketVolume: 12345, currency: 'AUD', regularMarketTime: 1717200000,
      currentTradingPeriod: { regular: { start: 1717196400, end: 1717218000 } },
    },
    timestamp: [1717100000, 1717200000],
    indicators: { quote: [{
      open: [69.5, 70.1], high: [70.6, 70.9], low: [69.1, 70.0],
      close: [70.0, 70.5], volume: [1000, 2000],
    }] },
  }] },
};

describe('yahoo', () => {
  afterEach(() => vi.restoreAllMocks());

  it('builds the chart URL with .AX suffix and params', () => {
    expect(chartUrl('VHY', '5d', '1d')).toBe(
      'https://query1.finance.yahoo.com/v8/finance/chart/VHY.AX?range=5d&interval=1d',
    );
  });

  it('normalises a quote with change and sparkline', () => {
    const q = normaliseQuote('VHY', sample);
    expect(q.symbol).toBe('VHY');
    expect(q.price).toBe(70.5);
    expect(q.prevClose).toBe(70.0);
    expect(q.change).toBeCloseTo(0.5, 5);
    expect(q.changePct).toBeCloseTo((0.5 / 70) * 100, 5);
    expect(q.spark).toEqual([70.0, 70.5]);
    expect(q.currency).toBe('AUD');
  });

  it('normalises history into candle rows, skipping null gaps', () => {
    const candles = normaliseHistory(sample);
    expect(candles).toHaveLength(2);
    expect(candles[0]).toEqual({ t: 1717100000, o: 69.5, h: 70.6, l: 69.1, c: 70.0, v: 1000 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run server/yahoo.test.ts`
Expected: FAIL — cannot find module `./yahoo`.

- [ ] **Step 3: Write minimal implementation**

```ts
// server/yahoo.ts
export interface Quote {
  symbol: string; price: number; prevClose: number;
  change: number; changePct: number; volume: number;
  currency: string; spark: number[];
}
export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number; }

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

export function chartUrl(symbol: string, range: string, interval: string): string {
  return `${BASE}/${symbol}.AX?range=${range}&interval=${interval}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseQuote(symbol: string, json: any): Quote {
  const r = json?.chart?.result?.[0];
  if (!r) throw new Error('no chart result');
  const m = r.meta;
  const price = m.regularMarketPrice;
  const prevClose = m.chartPreviousClose ?? m.previousClose;
  const closes: number[] = (r.indicators?.quote?.[0]?.close ?? []).filter(
    (c: number | null) => c != null,
  );
  return {
    symbol,
    price,
    prevClose,
    change: price - prevClose,
    changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    volume: m.regularMarketVolume ?? 0,
    currency: m.currency ?? 'AUD',
    spark: closes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseHistory(json: any): Candle[] {
  const r = json?.chart?.result?.[0];
  if (!r) return [];
  const t: number[] = r.timestamp ?? [];
  const q = r.indicators?.quote?.[0] ?? {};
  const out: Candle[] = [];
  for (let i = 0; i < t.length; i++) {
    if (q.close?.[i] == null) continue;
    out.push({ t: t[i], o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i], v: q.volume?.[i] ?? 0 });
  }
  return out;
}

export async function fetchChart(symbol: string, range: string, interval: string): Promise<unknown> {
  const res = await fetch(chartUrl(symbol, range, interval), {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`yahoo ${res.status} for ${symbol}`);
  return res.json();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run server/yahoo.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd asx-invest && git add server/yahoo.ts server/yahoo.test.ts
git commit -m "feat: add Yahoo chart fetch and normalisers"
```

---

## Task 3: Proxy middleware + Vite plugin

**Files:**
- Create: `server/middleware.ts`, `server/plugin.ts`
- Modify: `vite.config.ts`
- Test: `server/middleware.test.ts`

- [ ] **Step 1: Write the failing test** (handlers, transport-agnostic)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as yahoo from './yahoo';
import { handleQuotes, handleHistory } from './middleware';

const fakeJson = { _fake: true };

describe('middleware handlers', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('handleQuotes returns one normalised quote per symbol', async () => {
    vi.spyOn(yahoo, 'fetchChart').mockResolvedValue(fakeJson);
    vi.spyOn(yahoo, 'normaliseQuote').mockImplementation((s) => ({
      symbol: s, price: 1, prevClose: 1, change: 0, changePct: 0, volume: 0, currency: 'AUD', spark: [1],
    }));
    const out = await handleQuotes('VHY,CBA');
    expect(out.map((q) => q.symbol)).toEqual(['VHY', 'CBA']);
  });

  it('handleQuotes skips a symbol whose fetch fails', async () => {
    vi.spyOn(yahoo, 'normaliseQuote').mockImplementation((s) => ({
      symbol: s, price: 1, prevClose: 1, change: 0, changePct: 0, volume: 0, currency: 'AUD', spark: [1],
    }));
    vi.spyOn(yahoo, 'fetchChart').mockImplementation(async (s) => {
      if (s === 'BAD') throw new Error('boom');
      return fakeJson;
    });
    const out = await handleQuotes('VHY,BAD');
    expect(out.map((q) => q.symbol)).toEqual(['VHY']);
  });

  it('handleHistory returns candles for the symbol', async () => {
    vi.spyOn(yahoo, 'fetchChart').mockResolvedValue(fakeJson);
    vi.spyOn(yahoo, 'normaliseHistory').mockReturnValue([{ t: 1, o: 1, h: 1, l: 1, c: 1, v: 1 }]);
    const out = await handleHistory('VHY', '1mo', '1d');
    expect(out.symbol).toBe('VHY');
    expect(out.candles).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run server/middleware.test.ts`
Expected: FAIL — cannot find module `./middleware`.

- [ ] **Step 3: Write `server/middleware.ts`**

```ts
import type { Connect } from 'vite';
import { TtlCache } from './cache';
import { fetchChart, normaliseQuote, normaliseHistory, type Quote, type Candle } from './yahoo';

const quoteCache = new TtlCache<Quote>(60_000);
const historyCache = new TtlCache<Candle[]>(15 * 60_000);

export async function handleQuotes(symbolsParam: string): Promise<Quote[]> {
  const symbols = symbolsParam.split(',').map((s) => s.trim()).filter(Boolean);
  const results = await Promise.allSettled(
    symbols.map((s) =>
      quoteCache.getOrFetch(s, async () => normaliseQuote(s, await fetchChart(s, '5d', '1d'))),
    ),
  );
  return results.filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled').map((r) => r.value);
}

export async function handleHistory(symbol: string, range: string, interval: string) {
  const candles = await historyCache.getOrFetch(
    `${symbol}:${range}:${interval}`,
    async () => normaliseHistory(await fetchChart(symbol, range, interval)),
  );
  return { symbol, candles };
}

function sendJson(res: Parameters<Connect.NextHandleFunction>[1], status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export const apiMiddleware: Connect.NextHandleFunction = (req, res, next) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return next();

  if (url.pathname === '/api/quotes') {
    handleQuotes(url.searchParams.get('symbols') ?? '')
      .then((data) => sendJson(res, 200, data))
      .catch((e) => sendJson(res, 502, { error: String(e) }));
    return;
  }
  if (url.pathname === '/api/history') {
    const symbol = url.searchParams.get('symbol');
    if (!symbol) return sendJson(res, 400, { error: 'symbol required' });
    handleHistory(symbol, url.searchParams.get('range') ?? '1mo', url.searchParams.get('interval') ?? '1d')
      .then((data) => sendJson(res, 200, data))
      .catch((e) => sendJson(res, 502, { error: String(e) }));
    return;
  }
  return sendJson(res, 404, { error: 'not found' });
};
```

- [ ] **Step 4: Write `server/plugin.ts`**

```ts
import type { Plugin } from 'vite';
import { apiMiddleware } from './middleware';

export function apiProxyPlugin(): Plugin {
  return {
    name: 'asx-api-proxy',
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
```

- [ ] **Step 5: Wire the plugin into `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiProxyPlugin } from './server/plugin';

export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
  server: { port: 5173 },
});
```

- [ ] **Step 6: Run handler tests**

Run: `cd asx-invest && npx vitest run server/middleware.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Manual live check of the proxy**

Run: `cd asx-invest && (npm run dev >/tmp/asx-dev.log 2>&1 &) ; sleep 6 ; curl -s "http://localhost:5173/api/quotes?symbols=VHY,CBA" ; echo ; pkill -f vite`
Expected: JSON array with objects for VHY and CBA including numeric `price`. If Yahoo is unreachable, an empty `[]` is acceptable — note it and continue.

- [ ] **Step 8: Commit**

```bash
cd asx-invest && git add server/middleware.ts server/middleware.test.ts server/plugin.ts vite.config.ts
git commit -m "feat: add API proxy middleware and Vite plugin"
```

---

## Task 4: Shared types + instrument seed

**Files:**
- Create: `src/types.ts`, `src/data/instruments.ts`
- Test: `src/data/instruments.test.ts`

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type Category = 'high-yield-etf' | 'growth-etf' | 'bond-etf' | 'blue-chip' | 'a-reit';

export interface Instrument {
  symbol: string;
  name: string;
  category: Category;
  cashYield?: number;
  grossYield?: number;
  mer?: number;
  franking?: 'Fully' | 'Partial' | 'Unfranked';
  focus?: string;
}

export interface Quote {
  symbol: string; price: number; prevClose: number;
  change: number; changePct: number; volume: number;
  currency: string; spark: number[];
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number; }
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { INSTRUMENTS } from './instruments';

describe('INSTRUMENTS', () => {
  it('has 29 unique symbols', () => {
    const symbols = INSTRUMENTS.map((i) => i.symbol);
    expect(symbols).toHaveLength(29);
    expect(new Set(symbols).size).toBe(29);
  });

  it('includes the user-added growth ETFs', () => {
    const growth = INSTRUMENTS.filter((i) => i.category === 'growth-etf').map((i) => i.symbol);
    expect(growth.sort()).toEqual(['ACDC', 'ESGI', 'VAS', 'VDHG', 'VGS']);
  });

  it('every instrument has a name and category', () => {
    for (const i of INSTRUMENTS) {
      expect(i.name.length).toBeGreaterThan(0);
      expect(i.category).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/data/instruments.test.ts`
Expected: FAIL — cannot find module `./instruments`.

- [ ] **Step 4: Write `src/data/instruments.ts`** (values from the guide; growth ETFs seeded with issuer MER, yields omitted)

```ts
import type { Instrument } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // High-yield ETFs
  { symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf', cashYield: 5.0, grossYield: 7.1, mer: 0.25, franking: 'Fully', focus: 'High-yield ASX shares' },
  { symbol: 'A200', name: 'BetaShares Australia 200', category: 'high-yield-etf', cashYield: 4.0, grossYield: 5.7, mer: 0.07, franking: 'Fully', focus: 'Broad ASX top 200' },
  { symbol: 'MVW', name: 'VanEck Aust. Equal Weight', category: 'high-yield-etf', cashYield: 4.2, grossYield: 6.0, mer: 0.35, franking: 'Fully', focus: 'Equal-weight ASX 100' },
  { symbol: 'DGRO', name: 'iShares Aust. Div. Growers', category: 'high-yield-etf', cashYield: 3.8, grossYield: 5.4, mer: 0.30, franking: 'Fully', focus: 'Growing dividend history' },
  { symbol: 'SYI', name: 'SPDR S&P/ASX Dividends', category: 'high-yield-etf', cashYield: 5.5, grossYield: 7.5, mer: 0.35, franking: 'Fully', focus: 'Top 50 ASX dividend payers' },
  { symbol: 'VAP', name: 'Vanguard Aust. Property Sec.', category: 'high-yield-etf', cashYield: 4.5, mer: 0.23, franking: 'Unfranked', focus: 'Diversified A-REIT exposure' },
  // Growth & diversified ETFs (user additions; not in guide)
  { symbol: 'VAS', name: 'Vanguard Australian Shares', category: 'growth-etf', mer: 0.07, franking: 'Fully', focus: 'Broad ASX 300' },
  { symbol: 'VGS', name: 'Vanguard MSCI Intl Shares', category: 'growth-etf', mer: 0.18, franking: 'Unfranked', focus: 'Global developed markets' },
  { symbol: 'VDHG', name: 'Vanguard Diversified High Growth', category: 'growth-etf', mer: 0.27, focus: 'Multi-asset high growth' },
  { symbol: 'ACDC', name: 'Global X Battery Tech & Lithium', category: 'growth-etf', mer: 0.69, focus: 'Battery / lithium thematic' },
  { symbol: 'ESGI', name: 'VanEck MSCI Intl Sustainable', category: 'growth-etf', mer: 0.55, focus: 'International ESG equity' },
  // Bond / cash ETFs
  { symbol: 'AGVT', name: 'BetaShares Aust. Govt Bond', category: 'bond-etf', cashYield: 4.1, mer: 0.22, focus: 'Govt bonds, monthly income' },
  { symbol: 'VAF', name: 'Vanguard Aust. Fixed Interest', category: 'bond-etf', cashYield: 4.5, mer: 0.20, focus: 'Broad bonds' },
  { symbol: 'IAF', name: 'iShares Core Composite Bond', category: 'bond-etf', cashYield: 4.4, mer: 0.15, focus: 'Composite bond' },
  { symbol: 'AAA', name: 'BetaShares Aust. High Int. Cash', category: 'bond-etf', cashYield: 4.8, mer: 0.18, focus: 'Cash-like, daily liquidity' },
  { symbol: 'RCB', name: 'Russell Aust. Select Corp Bond', category: 'bond-etf', cashYield: 5.1, mer: 0.28, focus: 'Corporate credit' },
  // Blue-chip shares
  { symbol: 'CBA', name: 'Commonwealth Bank', category: 'blue-chip', cashYield: 4.5, grossYield: 6.4, franking: 'Fully', focus: 'Banking' },
  { symbol: 'NAB', name: 'National Australia Bank', category: 'blue-chip', cashYield: 5.5, grossYield: 7.9, franking: 'Fully', focus: 'Banking' },
  { symbol: 'ANZ', name: 'ANZ Group', category: 'blue-chip', cashYield: 6.0, grossYield: 8.6, franking: 'Fully', focus: 'Banking' },
  { symbol: 'WBC', name: 'Westpac', category: 'blue-chip', cashYield: 5.8, grossYield: 8.3, franking: 'Fully', focus: 'Banking' },
  { symbol: 'BHP', name: 'BHP Group', category: 'blue-chip', cashYield: 5.2, grossYield: 7.4, franking: 'Fully', focus: 'Resources' },
  { symbol: 'WES', name: 'Wesfarmers', category: 'blue-chip', cashYield: 3.5, grossYield: 5.0, franking: 'Fully', focus: 'Consumer' },
  { symbol: 'WOW', name: 'Woolworths', category: 'blue-chip', cashYield: 3.8, grossYield: 5.4, franking: 'Fully', focus: 'Consumer staples' },
  { symbol: 'TLS', name: 'Telstra', category: 'blue-chip', cashYield: 4.8, grossYield: 5.9, franking: 'Partial', focus: 'Telecom' },
  // A-REITs
  { symbol: 'GMG', name: 'Goodman Group', category: 'a-reit', cashYield: 1.5, franking: 'Unfranked', focus: 'Industrial / logistics' },
  { symbol: 'SCG', name: 'Scentre Group', category: 'a-reit', cashYield: 6.5, franking: 'Unfranked', focus: 'Retail (Westfields)' },
  { symbol: 'CHC', name: 'Charter Hall', category: 'a-reit', cashYield: 4.0, franking: 'Partial', focus: 'Diversified / funds mgmt' },
  { symbol: 'DXS', name: 'Dexus', category: 'a-reit', cashYield: 5.8, franking: 'Unfranked', focus: 'Office / industrial' },
  { symbol: 'MGR', name: 'Mirvac Group', category: 'a-reit', cashYield: 5.0, franking: 'Unfranked', focus: 'Residential dev.' },
  { symbol: 'CQR', name: 'Charter Hall Retail REIT', category: 'a-reit', cashYield: 6.0, franking: 'Unfranked', focus: 'Convenience retail' },
];

export const CATEGORY_LABELS: Record<Instrument['category'], string> = {
  'high-yield-etf': 'High-Yield ETFs',
  'growth-etf': 'Growth & Diversified ETFs',
  'bond-etf': 'Bond & Cash ETFs',
  'blue-chip': 'Blue-Chip Shares',
  'a-reit': 'A-REITs',
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run src/data/instruments.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/types.ts src/data/instruments.ts src/data/instruments.test.ts
git commit -m "feat: add shared types and 29-instrument seed"
```

---

## Task 5: Formatting helpers + API client + hooks

**Files:**
- Create: `src/lib/format.ts`, `src/api/client.ts`, `src/api/hooks.ts`
- Test: `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing test for formatters**

```ts
import { describe, it, expect } from 'vitest';
import { fmtCurrency, fmtPct, fmtSignedPct } from './format';

describe('format', () => {
  it('formats AUD currency', () => { expect(fmtCurrency(1234.5)).toBe('$1,234.50'); });
  it('formats a percent', () => { expect(fmtPct(5)).toBe('5.00%'); });
  it('formats a signed percent', () => {
    expect(fmtSignedPct(2.5)).toBe('+2.50%');
    expect(fmtSignedPct(-2.5)).toBe('-2.50%');
  });
  it('renders a dash for undefined', () => { expect(fmtPct(undefined)).toBe('—'); });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/lib/format.test.ts`
Expected: FAIL — cannot find module `./format`.

- [ ] **Step 3: Write `src/lib/format.ts`**

```ts
export function fmtCurrency(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(v);
}
export function fmtPct(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v.toFixed(2)}%`;
}
export function fmtSignedPct(v: number | undefined): string {
  if (v == null || Number.isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run src/lib/format.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write `src/api/client.ts`**

```ts
import type { Quote, Candle } from '../types';

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  const res = await fetch(`/api/quotes?symbols=${symbols.join(',')}`);
  if (!res.ok) throw new Error(`quotes ${res.status}`);
  return res.json();
}

export async function fetchHistory(symbol: string, range: string, interval: string): Promise<Candle[]> {
  const res = await fetch(`/api/history?symbol=${symbol}&range=${range}&interval=${interval}`);
  if (!res.ok) throw new Error(`history ${res.status}`);
  const json = (await res.json()) as { symbol: string; candles: Candle[] };
  return json.candles;
}
```

- [ ] **Step 6: Write `src/api/hooks.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { fetchQuotes, fetchHistory } from './client';
import type { Quote } from '../types';

export function useQuotes(symbols: string[]) {
  return useQuery({
    queryKey: ['quotes', symbols.join(',')],
    queryFn: () => fetchQuotes(symbols),
    select: (data: Quote[]) => Object.fromEntries(data.map((q) => [q.symbol, q])) as Record<string, Quote>,
  });
}

export function useHistory(symbol: string, range: string, interval: string) {
  return useQuery({
    queryKey: ['history', symbol, range, interval],
    queryFn: () => fetchHistory(symbol, range, interval),
    staleTime: 15 * 60 * 1000,
  });
}
```

- [ ] **Step 7: Typecheck**

Run: `cd asx-invest && npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd asx-invest && git add src/lib/format.ts src/lib/format.test.ts src/api/client.ts src/api/hooks.ts
git commit -m "feat: add formatters, API client and query hooks"
```

---

## Task 6: App shell, routing, layout

**Files:**
- Create: `src/components/Layout.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/Layout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from './Layout';

describe('Layout', () => {
  it('renders nav links and children', () => {
    render(
      <MemoryRouter>
        <Layout><div>child content</div></Layout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Yields')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/components/Layout.test.tsx`
Expected: FAIL — cannot find module `./Layout`.

- [ ] **Step 3: Write `src/components/Layout.tsx`**

```tsx
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '.4rem .9rem', borderRadius: 30, fontWeight: 600, fontSize: '.9rem',
  color: isActive ? 'var(--navy)' : 'rgba(255,255,255,.7)',
  background: isActive ? 'var(--gold)' : 'transparent',
});

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '.5rem', alignItems: 'center', height: 64,
        padding: '0 1.5rem', background: 'var(--navy-mid)', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontWeight: 800, marginRight: '1rem' }}>🇦🇺 ASX Tracker</span>
        <NavLink to="/" style={linkStyle} end>Dashboard</NavLink>
        <NavLink to="/portfolio" style={linkStyle}>Portfolio</NavLink>
        <NavLink to="/yields" style={linkStyle}>Yields</NavLink>
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          Prices ~15-min delayed
        </span>
      </nav>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { Detail } from './features/detail/Detail';
import { Portfolio } from './features/portfolio/Portfolio';
import { Yields } from './features/yields/Yields';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/instrument/:symbol" element={<Detail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/yields" element={<Yields />} />
      </Routes>
    </Layout>
  );
}
```

- [ ] **Step 5: Create temporary stubs so the app compiles** (replaced in later tasks)

Create `src/features/dashboard/Dashboard.tsx`, `src/features/detail/Detail.tsx`, `src/features/portfolio/Portfolio.tsx`, `src/features/yields/Yields.tsx`, each:

```tsx
export function Dashboard() { return <div>Dashboard</div>; }
```
(adjust the exported name per file: `Detail`, `Portfolio`, `Yields`.)

- [ ] **Step 6: Run test + typecheck**

Run: `cd asx-invest && npx vitest run src/components/Layout.test.tsx && npm run typecheck`
Expected: test PASS; typecheck no errors.

- [ ] **Step 7: Commit**

```bash
cd asx-invest && git add src/App.tsx src/components/Layout.tsx src/components/Layout.test.tsx src/features
git commit -m "feat: add app shell, routing and layout"
```

---

## Task 7: Sparkline + ChangeBadge components

**Files:**
- Create: `src/components/Sparkline.tsx`, `src/components/ChangeBadge.tsx`
- Test: `src/components/ChangeBadge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChangeBadge } from './ChangeBadge';

describe('ChangeBadge', () => {
  it('shows a green up value for positive change', () => {
    render(<ChangeBadge changePct={2.5} />);
    const el = screen.getByText('+2.50%');
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ color: 'var(--green)' });
  });
  it('shows a red value for negative change', () => {
    render(<ChangeBadge changePct={-1.1} />);
    expect(screen.getByText('-1.10%')).toHaveStyle({ color: 'var(--red)' });
  });
  it('shows a dash when undefined', () => {
    render(<ChangeBadge changePct={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/components/ChangeBadge.test.tsx`
Expected: FAIL — cannot find module `./ChangeBadge`.

- [ ] **Step 3: Write `src/components/ChangeBadge.tsx`**

```tsx
import { fmtSignedPct } from '../lib/format';

export function ChangeBadge({ changePct }: { changePct: number | undefined }) {
  const color = changePct == null ? 'var(--text-muted)' : changePct >= 0 ? 'var(--green)' : 'var(--red)';
  return <span style={{ color, fontFamily: 'var(--mono)', fontWeight: 700 }}>{fmtSignedPct(changePct)}</span>;
}
```

- [ ] **Step 4: Write `src/components/Sparkline.tsx`**

```tsx
import { LineChart, Line, YAxis } from 'recharts';

export function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  if (!data || data.length < 2) return <div style={{ height: 36 }} />;
  const points = data.map((v, i) => ({ i, v }));
  return (
    <LineChart width={120} height={36} data={points}>
      <YAxis hide domain={['dataMin', 'dataMax']} />
      <Line type="monotone" dataKey="v" dot={false} strokeWidth={2}
        stroke={up ? 'var(--green)' : 'var(--red)'} isAnimationActive={false} />
    </LineChart>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run src/components/ChangeBadge.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/components/Sparkline.tsx src/components/ChangeBadge.tsx src/components/ChangeBadge.test.tsx
git commit -m "feat: add Sparkline and ChangeBadge components"
```

---

## Task 8: Dashboard

**Files:**
- Create: `src/features/dashboard/InstrumentCard.tsx`
- Modify: `src/features/dashboard/Dashboard.tsx`
- Test: `src/features/dashboard/InstrumentCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InstrumentCard } from './InstrumentCard';
import type { Instrument, Quote } from '../../types';

const inst: Instrument = { symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf', cashYield: 5 };

function renderCard(quote?: Quote) {
  return render(<MemoryRouter><InstrumentCard instrument={inst} quote={quote} /></MemoryRouter>);
}

describe('InstrumentCard', () => {
  it('renders the live price when a quote is present', () => {
    renderCard({ symbol: 'VHY', price: 70.5, prevClose: 70, change: 0.5, changePct: 0.71, volume: 1, currency: 'AUD', spark: [70, 70.5] });
    expect(screen.getByText('$70.50')).toBeInTheDocument();
    expect(screen.getByText('VHY')).toBeInTheDocument();
  });
  it('shows "price unavailable" when no quote', () => {
    renderCard(undefined);
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/features/dashboard/InstrumentCard.test.tsx`
Expected: FAIL — cannot find module `./InstrumentCard`.

- [ ] **Step 3: Write `src/features/dashboard/InstrumentCard.tsx`**

```tsx
import { Link } from 'react-router-dom';
import type { Instrument, Quote } from '../../types';
import { fmtCurrency } from '../../lib/format';
import { ChangeBadge } from '../../components/ChangeBadge';
import { Sparkline } from '../../components/Sparkline';

export function InstrumentCard({ instrument, quote }: { instrument: Instrument; quote?: Quote }) {
  const up = (quote?.change ?? 0) >= 0;
  return (
    <Link to={`/instrument/${instrument.symbol}`}
      style={{ display: 'block', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong>{instrument.symbol}</strong>
        <ChangeBadge changePct={quote?.changePct} />
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: '.15rem 0 .5rem' }}>
        {instrument.name}
      </div>
      {quote ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--mono)' }}>
            {fmtCurrency(quote.price)}
          </span>
          <Sparkline data={quote.spark} up={up} />
        </div>
      ) : (
        <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Price unavailable</div>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: Write `src/features/dashboard/Dashboard.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { INSTRUMENTS, CATEGORY_LABELS } from '../../data/instruments';
import type { Category } from '../../types';
import { useQuotes } from '../../api/hooks';
import { InstrumentCard } from './InstrumentCard';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function Dashboard() {
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes, isFetching, dataUpdatedAt } = useQuotes(symbols);
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const shown = INSTRUMENTS.filter((i) => filter === 'all' || i.category === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} style={chip(filter === c)}>{CATEGORY_LABELS[c]}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          {isFetching ? 'Updating…' : dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ''}
        </span>
      </div>
      {CATEGORIES.filter((c) => filter === 'all' || c === filter).map((c) => {
        const items = shown.filter((i) => i.category === c);
        if (!items.length) return null;
        return (
          <section key={c} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '.95rem', margin: '.5rem 0' }}>{CATEGORY_LABELS[c]}</h2>
            <div style={{ display: 'grid', gap: '.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {items.map((i) => <InstrumentCard key={i.symbol} instrument={i} quote={quotes?.[i.symbol]} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function chip(active: boolean): React.CSSProperties {
  return { padding: '.35rem .8rem', borderRadius: 30, border: '1px solid var(--border)', cursor: 'pointer',
    background: active ? 'var(--gold)' : 'transparent', color: active ? 'var(--navy)' : 'var(--text)', fontWeight: 600 };
}
```

- [ ] **Step 5: Run test + typecheck**

Run: `cd asx-invest && npx vitest run src/features/dashboard/InstrumentCard.test.tsx && npm run typecheck`
Expected: test PASS (2); typecheck no errors.

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/features/dashboard
git commit -m "feat: add dashboard with instrument cards and filtering"
```

---

## Task 9: Detail view with chart

**Files:**
- Create: `src/features/detail/PriceChart.tsx`
- Modify: `src/features/detail/Detail.tsx`
- Test: `src/features/detail/Detail.test.tsx`

- [ ] **Step 1: Write the failing test** (chart is mocked — lightweight-charts needs canvas)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Detail } from './Detail';

vi.mock('./PriceChart', () => ({ PriceChart: () => <div>chart</div> }));
vi.mock('../../api/hooks', () => ({
  useHistory: () => ({ data: [], isLoading: false, isError: false }),
}));

describe('Detail', () => {
  it('renders the instrument name and guide stats for a known symbol', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/instrument/VHY']}>
          <Routes><Route path="/instrument/:symbol" element={<Detail />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText(/Vanguard Aust\. High Yield/)).toBeInTheDocument();
    expect(screen.getByText(/MER/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/features/detail/Detail.test.tsx`
Expected: FAIL — cannot find module `./PriceChart` / `./Detail` incomplete.

- [ ] **Step 3: Write `src/features/detail/PriceChart.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { createChart, type IChartApi } from 'lightweight-charts';
import type { Candle } from '../../types';

export function PriceChart({ candles }: { candles: Candle[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart: IChartApi = createChart(ref.current, {
      height: 360,
      layout: { background: { color: 'transparent' }, textColor: '#9CA3AF' },
      grid: { vertLines: { color: '#1A3355' }, horzLines: { color: '#1A3355' } },
      timeScale: { timeVisible: true },
    });
    const series = chart.addAreaSeries({ lineColor: '#F5A623', topColor: 'rgba(245,166,35,.3)', bottomColor: 'rgba(245,166,35,0)' });
    series.setData(candles.map((c) => ({ time: c.t as never, value: c.c })));
    chart.timeScale().fitContent();
    const onResize = () => chart.applyOptions({ width: ref.current!.clientWidth });
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, [candles]);
  return <div ref={ref} style={{ width: '100%' }} />;
}
```

- [ ] **Step 4: Write `src/features/detail/Detail.tsx`**

```tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INSTRUMENTS } from '../../data/instruments';
import { useHistory } from '../../api/hooks';
import { fmtPct } from '../../lib/format';
import { PriceChart } from './PriceChart';

const RANGES: { label: string; range: string; interval: string }[] = [
  { label: '1D', range: '1d', interval: '5m' },
  { label: '5D', range: '5d', interval: '30m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
];

export function Detail() {
  const { symbol } = useParams();
  const instrument = INSTRUMENTS.find((i) => i.symbol === symbol);
  const [r, setR] = useState(RANGES[2]);
  const { data: candles, isLoading, isError } = useHistory(symbol ?? '', r.range, r.interval);

  if (!instrument) return <div>Unknown symbol. <Link to="/">Back</Link></div>;

  return (
    <div>
      <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>← Dashboard</Link>
      <h1 style={{ margin: '.5rem 0' }}>{instrument.symbol} · {instrument.name}</h1>
      <div style={{ display: 'flex', gap: '.4rem', margin: '.75rem 0' }}>
        {RANGES.map((opt) => (
          <button key={opt.label} onClick={() => setR(opt)}
            style={{ padding: '.3rem .7rem', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--border)', background: opt.label === r.label ? 'var(--gold)' : 'transparent',
              color: opt.label === r.label ? 'var(--navy)' : 'var(--text)' }}>{opt.label}</button>
        ))}
      </div>
      {isLoading && <div style={{ color: 'var(--text-muted)' }}>Loading chart…</div>}
      {isError && <div style={{ color: 'var(--red)' }}>Chart unavailable. <button onClick={() => setR({ ...r })}>Retry</button></div>}
      {candles && candles.length > 0 && <PriceChart candles={candles} />}
      <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginTop: '1.25rem' }}>
        <Stat label="Cash Yield" value={fmtPct(instrument.cashYield)} />
        <Stat label="Gross Yield" value={fmtPct(instrument.grossYield)} />
        <Stat label="MER" value={fmtPct(instrument.mer)} />
        <Stat label="Franking" value={instrument.franking ?? '—'} />
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: '.75rem' }}>{instrument.focus}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '.75rem' }}>
      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.1rem' }}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 5: Run test + typecheck**

Run: `cd asx-invest && npx vitest run src/features/detail/Detail.test.tsx && npm run typecheck`
Expected: test PASS; typecheck no errors.

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/features/detail
git commit -m "feat: add detail view with interactive price chart"
```

---

## Task 10: Portfolio store + math

**Files:**
- Create: `src/store/portfolio.ts`
- Test: `src/store/portfolio.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { loadHoldings, saveHoldings, holdingMetrics, type Holding } from './portfolio';

describe('portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('persists and reloads holdings', () => {
    const h: Holding[] = [{ symbol: 'VHY', units: 100, buyPrice: 65 }];
    saveHoldings(h);
    expect(loadHoldings()).toEqual(h);
  });

  it('returns empty array when nothing stored', () => {
    expect(loadHoldings()).toEqual([]);
  });

  it('computes value, gain/loss and income', () => {
    const m = holdingMetrics({ symbol: 'VHY', units: 100, buyPrice: 65 }, 70, 5);
    expect(m.value).toBe(7000);
    expect(m.cost).toBe(6500);
    expect(m.gain).toBe(500);
    expect(m.gainPct).toBeCloseTo((500 / 6500) * 100, 5);
    expect(m.annualIncome).toBe(7000 * 0.05);
  });

  it('handles a missing live price (price undefined) without NaN', () => {
    const m = holdingMetrics({ symbol: 'VHY', units: 100, buyPrice: 65 }, undefined, 5);
    expect(m.value).toBeUndefined();
    expect(m.gain).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/store/portfolio.test.ts`
Expected: FAIL — cannot find module `./portfolio`.

- [ ] **Step 3: Write `src/store/portfolio.ts`**

```ts
export interface Holding { symbol: string; units: number; buyPrice: number; }
export interface HoldingMetrics {
  cost: number;
  value?: number; gain?: number; gainPct?: number; annualIncome?: number;
}

const KEY = 'asx-portfolio';

export function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Holding[]) : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  localStorage.setItem(KEY, JSON.stringify(holdings));
}

export function holdingMetrics(h: Holding, price: number | undefined, cashYieldPct: number | undefined): HoldingMetrics {
  const cost = h.units * h.buyPrice;
  if (price == null) return { cost };
  const value = h.units * price;
  return {
    cost,
    value,
    gain: value - cost,
    gainPct: cost ? ((value - cost) / cost) * 100 : 0,
    annualIncome: cashYieldPct != null ? value * (cashYieldPct / 100) : undefined,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run src/store/portfolio.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd asx-invest && git add src/store/portfolio.ts src/store/portfolio.test.ts
git commit -m "feat: add portfolio store and metrics math"
```

---

## Task 11: Portfolio view

**Files:**
- Create: `src/features/portfolio/HoldingForm.tsx`
- Modify: `src/features/portfolio/Portfolio.tsx`
- Test: `src/features/portfolio/Portfolio.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Portfolio } from './Portfolio';

vi.mock('../../api/hooks', () => ({
  useQuotes: () => ({ data: { VHY: { symbol: 'VHY', price: 70, prevClose: 69, change: 1, changePct: 1.4, volume: 1, currency: 'AUD', spark: [69, 70] } } }),
}));

describe('Portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('shows an empty state initially', () => {
    render(<Portfolio />);
    expect(screen.getByText(/no holdings/i)).toBeInTheDocument();
  });

  it('adds a holding and shows its live value', async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    await user.selectOptions(screen.getByLabelText(/symbol/i), 'VHY');
    await user.type(screen.getByLabelText(/units/i), '100');
    await user.type(screen.getByLabelText(/buy price/i), '65');
    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('$7,000.00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/features/portfolio/Portfolio.test.tsx`
Expected: FAIL — module incomplete.

- [ ] **Step 3: Write `src/features/portfolio/HoldingForm.tsx`**

```tsx
import { useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import type { Holding } from '../../store/portfolio';

export function HoldingForm({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);
  const [units, setUnits] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = parseFloat(units); const p = parseFloat(buyPrice);
    if (!u || !p) return;
    onAdd({ symbol, units: u, buyPrice: p });
    setUnits(''); setBuyPrice('');
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <label>Symbol
        <select aria-label="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {INSTRUMENTS.map((i) => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </label>
      <label>Units
        <input aria-label="units" type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
      </label>
      <label>Buy price
        <input aria-label="buy price" type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
```

- [ ] **Step 4: Write `src/features/portfolio/Portfolio.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import { useQuotes } from '../../api/hooks';
import { loadHoldings, saveHoldings, holdingMetrics, type Holding } from '../../store/portfolio';
import { fmtCurrency, fmtSignedPct } from '../../lib/format';
import { HoldingForm } from './HoldingForm';

export function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings());
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes } = useQuotes(symbols);

  function update(next: Holding[]) { setHoldings(next); saveHoldings(next); }
  function add(h: Holding) { update([...holdings, h]); }
  function remove(idx: number) { update(holdings.filter((_, i) => i !== idx)); }

  return (
    <div>
      <h1>Portfolio</h1>
      <HoldingForm onAdd={add} />
      {holdings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No holdings yet — add one above to track its live value.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '.78rem' }}>
            <th>Symbol</th><th>Units</th><th>Buy</th><th>Price</th><th>Value</th><th>Gain</th><th>Income/yr</th><th></th>
          </tr></thead>
          <tbody>
            {holdings.map((h, idx) => {
              const inst = INSTRUMENTS.find((i) => i.symbol === h.symbol);
              const price = quotes?.[h.symbol]?.price;
              const m = holdingMetrics(h, price, inst?.cashYield);
              return (
                <tr key={idx} style={{ borderTop: '1px solid var(--border)', fontFamily: 'var(--mono)' }}>
                  <td>{h.symbol}</td><td>{h.units}</td><td>{fmtCurrency(h.buyPrice)}</td>
                  <td>{fmtCurrency(price)}</td><td>{fmtCurrency(m.value)}</td>
                  <td style={{ color: (m.gain ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {fmtCurrency(m.gain)} ({fmtSignedPct(m.gainPct)})
                  </td>
                  <td>{fmtCurrency(m.annualIncome)}</td>
                  <td><button onClick={() => remove(idx)}>✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run test + typecheck**

Run: `cd asx-invest && npx vitest run src/features/portfolio/Portfolio.test.tsx && npm run typecheck`
Expected: test PASS (2); typecheck no errors.

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/features/portfolio
git commit -m "feat: add portfolio view with live value and income"
```

---

## Task 12: Income calculator math

**Files:**
- Create: `src/lib/income.ts`
- Test: `src/lib/income.test.ts`

The calculator mirrors the guide: gross-up fully franked income, apply the marginal rate, and report net income. Franking credit = cash × (0.30 / 0.70) for fully franked; grossed income = cash + credit; tax = grossed × rate; net = cash − tax + credit (credit is refundable).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { estimateIncome } from './income';

describe('estimateIncome', () => {
  it('computes fully franked income at a 32.5% rate', () => {
    // $50,000 at 5% cash, fully franked
    const r = estimateIncome({ amount: 50000, cashYieldPct: 5, franking: 'Fully', marginalRatePct: 32.5 });
    expect(r.cashIncome).toBe(2500);
    expect(r.frankingCredit).toBeCloseTo(2500 * (0.30 / 0.70), 4); // ≈ 1071.43
    const grossed = 2500 + 2500 * (0.30 / 0.70);
    const tax = grossed * 0.325;
    expect(r.netIncome).toBeCloseTo(2500 - tax + 2500 * (0.30 / 0.70), 2);
  });

  it('unfranked income has no franking credit', () => {
    const r = estimateIncome({ amount: 10000, cashYieldPct: 4, franking: 'Unfranked', marginalRatePct: 37 });
    expect(r.cashIncome).toBe(400);
    expect(r.frankingCredit).toBe(0);
    expect(r.netIncome).toBeCloseTo(400 - 400 * 0.37, 2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/lib/income.test.ts`
Expected: FAIL — cannot find module `./income`.

- [ ] **Step 3: Write `src/lib/income.ts`**

```ts
import type { Instrument } from '../types';

export interface IncomeInput {
  amount: number;
  cashYieldPct: number;
  franking: Instrument['franking'];
  marginalRatePct: number;
}
export interface IncomeResult {
  cashIncome: number; frankingCredit: number; grossedIncome: number;
  tax: number; netIncome: number;
}

const CORP_RATE = 0.30;

export function estimateIncome(input: IncomeInput): IncomeResult {
  const cashIncome = input.amount * (input.cashYieldPct / 100);
  const frankedFraction = input.franking === 'Fully' ? 1 : input.franking === 'Partial' ? 0.5 : 0;
  const frankingCredit = cashIncome * frankedFraction * (CORP_RATE / (1 - CORP_RATE));
  const grossedIncome = cashIncome + frankingCredit;
  const rate = input.marginalRatePct / 100;
  const tax = grossedIncome * rate;
  const netIncome = cashIncome - tax + frankingCredit;
  return { cashIncome, frankingCredit, grossedIncome, tax, netIncome };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd asx-invest && npx vitest run src/lib/income.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd asx-invest && git add src/lib/income.ts src/lib/income.test.ts
git commit -m "feat: add income-calculator math"
```

---

## Task 13: Yields view + income calculator UI

**Files:**
- Create: `src/features/yields/IncomeCalculator.tsx`
- Modify: `src/features/yields/Yields.tsx`
- Test: `src/features/yields/Yields.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Yields } from './Yields';

vi.mock('../../api/hooks', () => ({
  useQuotes: () => ({ data: { VHY: { symbol: 'VHY', price: 70, prevClose: 69, change: 1, changePct: 1.4, volume: 1, currency: 'AUD', spark: [69, 70] } } }),
}));

describe('Yields', () => {
  it('renders a row per instrument with live price merged in', () => {
    render(<Yields />);
    expect(screen.getByText('VHY')).toBeInTheDocument();
    expect(screen.getByText('$70.00')).toBeInTheDocument();
    expect(screen.getByText(/Income Calculator/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd asx-invest && npx vitest run src/features/yields/Yields.test.tsx`
Expected: FAIL — module incomplete.

- [ ] **Step 3: Write `src/features/yields/IncomeCalculator.tsx`**

```tsx
import { useState } from 'react';
import { estimateIncome } from '../../lib/income';
import type { Instrument } from '../../types';
import { fmtCurrency } from '../../lib/format';

const RATES = [0, 19, 32.5, 37, 47, 15];

export function IncomeCalculator() {
  const [amount, setAmount] = useState(50000);
  const [yieldPct, setYieldPct] = useState(5);
  const [franking, setFranking] = useState<Instrument['franking']>('Fully');
  const [rate, setRate] = useState(32.5);

  const r = estimateIncome({ amount, cashYieldPct: yieldPct, franking, marginalRatePct: rate });

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Income Calculator</h2>
      <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
        <label>Amount (A$)<input aria-label="amount" type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} /></label>
        <label>Cash yield %<input aria-label="yield" type="number" value={yieldPct} onChange={(e) => setYieldPct(+e.target.value)} /></label>
        <label>Franking
          <select aria-label="franking" value={franking} onChange={(e) => setFranking(e.target.value as Instrument['franking'])}>
            <option value="Fully">Fully</option><option value="Partial">Partial</option><option value="Unfranked">Unfranked</option>
          </select>
        </label>
        <label>Marginal rate %
          <select aria-label="rate" value={rate} onChange={(e) => setRate(+e.target.value)}>
            {RATES.map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginTop: '1rem' }}>
        <Out label="Cash income" value={fmtCurrency(r.cashIncome)} />
        <Out label="Franking credit" value={fmtCurrency(r.frankingCredit)} />
        <Out label="Grossed income" value={fmtCurrency(r.grossedIncome)} />
        <Out label="Net after tax" value={fmtCurrency(r.netIncome)} />
      </div>
    </div>
  );
}

function Out({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--gold)', fontSize: '1.15rem' }}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/features/yields/Yields.tsx`**

```tsx
import { useMemo } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import { useQuotes } from '../../api/hooks';
import { fmtCurrency, fmtPct } from '../../lib/format';
import { IncomeCalculator } from './IncomeCalculator';

export function Yields() {
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes } = useQuotes(symbols);

  return (
    <div>
      <h1>Yields & Income</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '.75rem' }}>
            <th>Symbol</th><th>Name</th><th>Price</th><th>Cash Yield</th><th>Gross Yield</th><th>MER</th><th>Franking</th>
          </tr></thead>
          <tbody>
            {INSTRUMENTS.map((i) => (
              <tr key={i.symbol} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ fontWeight: 700 }}>{i.symbol}</td>
                <td style={{ color: 'var(--text-muted)' }}>{i.name}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{fmtCurrency(quotes?.[i.symbol]?.price)}</td>
                <td>{fmtPct(i.cashYield)}</td><td>{fmtPct(i.grossYield)}</td>
                <td>{fmtPct(i.mer)}</td><td>{i.franking ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <IncomeCalculator />
    </div>
  );
}
```

- [ ] **Step 5: Run test + full suite + typecheck**

Run: `cd asx-invest && npx vitest run && npm run typecheck`
Expected: all tests PASS; typecheck clean.

- [ ] **Step 6: Commit**

```bash
cd asx-invest && git add src/features/yields
git commit -m "feat: add yields table and income calculator"
```

---

## Task 14: Full verification

- [ ] **Step 1: Run the whole test suite**

Run: `cd asx-invest && npm test`
Expected: all suites PASS.

- [ ] **Step 2: Typecheck + production build**

Run: `cd asx-invest && npm run typecheck && npm run build`
Expected: `tsc` clean; Vite build writes `dist/` with no errors.

- [ ] **Step 3: Manual smoke of the running app**

Run: `cd asx-invest && (npm run dev >/tmp/asx-dev.log 2>&1 &) ; sleep 6 ; curl -s "http://localhost:5173/api/quotes?symbols=VHY,VAS,CBA" | head -c 400 ; echo ; pkill -f vite`
Expected: JSON with numeric prices for VHY/VAS/CBA. Then verify in a browser: dashboard shows cards, a card opens the detail chart, portfolio adds a holding, yields page calculates income.

- [ ] **Step 4: Final commit**

```bash
cd asx-invest && git add -A
git commit -m "chore: verify build and tests green" --allow-empty
```

---

## Self-Review Notes

- **Spec coverage:** dashboard (T8), detail+chart (T9), portfolio (T10–11), yields+calculator (T12–13), proxy/cache/yahoo (T1–3), 29-instrument seed incl. growth ETFs (T4), dev-only Vite-middleware proxy (T3), 5-min polling (`main.tsx` defaults, T0), error/fallback states (T8 card, T9 chart, T11 empty state) — all mapped.
- **Type consistency:** `Quote`/`Candle`/`Instrument` defined once in `src/types.ts` and `server/yahoo.ts` mirrors the `Quote`/`Candle` shape used by the client; `holdingMetrics`, `estimateIncome`, `useQuotes` (returns `Record<symbol,Quote>`) signatures are used consistently across tasks.
- **No placeholders:** every code step contains full code; the only intentional stubs (T6 Step 5) are explicitly replaced in T8/T9/T11/T13.
