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
