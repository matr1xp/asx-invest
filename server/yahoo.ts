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

const DAY = 86400;

// Absolute window [date - lookback, date + 1 day] in unix seconds. The lookback
// (default 15 days) guarantees a trading day is captured even across weekends
// and holiday closures; the +1 day ensures the target date's own session counts.
export function periodRange(dateStr: string, lookbackDays = 15): { period1: number; period2: number } {
  const period2 = Math.floor(Date.parse(`${dateStr}T23:59:59Z`) / 1000) + 1;
  const period1 = period2 - (lookbackDays + 1) * DAY;
  return { period1, period2 };
}

export function priceHistoryUrl(symbol: string, period1: number, period2: number): string {
  return `${BASE}/${symbol}.AX?period1=${period1}&period2=${period2}&interval=1d`;
}

// The last candle in a window capped at the target date is the close on that
// date, or the most recent trading day before it. Null if the window is empty.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pickLastClose(json: any): number | null {
  const candles = normaliseHistory(json);
  return candles.length ? candles[candles.length - 1].c : null;
}

export async function fetchPriceOnDate(symbol: string, dateStr: string): Promise<number | null> {
  const { period1, period2 } = periodRange(dateStr);
  const res = await fetch(priceHistoryUrl(symbol, period1, period2), {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`yahoo ${res.status} for ${symbol}`);
  return pickLastClose(await res.json());
}
