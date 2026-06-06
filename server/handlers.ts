import type { IncomingMessage, ServerResponse } from 'node:http';
import { TtlCache } from './cache';
import { fetchChart, fetchPriceOnDate, normaliseQuote, normaliseHistory, type Quote, type Candle } from './yahoo';

export const SYMBOL_RE = /^[A-Z0-9]{1,10}$/;
export const VALID_RANGES = new Set(['1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max']);
export const VALID_INTERVALS = new Set(['1m','5m','15m','1d','1wk','1mo']);
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const quoteCache = new TtlCache<Quote>(60_000);
const historyCache = new TtlCache<Candle[]>(15 * 60_000);
const priceOnDateCache = new TtlCache<number | null>(60 * 60_000);

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export async function handleQuotes(symbolsParam: string): Promise<Quote[]> {
  const symbols = symbolsParam.split(',').slice(0, 50).map((s) => s.trim()).filter(Boolean);
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

export async function handlePriceOnDate(symbol: string, date: string) {
  const price = await priceOnDateCache.getOrFetch(
    `${symbol}:${date}`,
    () => fetchPriceOnDate(symbol, date),
  );
  return { symbol, date, price };
}

// routeApi handles any /api/* request. Returns true if the request was handled,
// false if the path doesn't start with /api/ (caller should serve static files).
export function routeApi(url: URL, req: IncomingMessage, res: ServerResponse): boolean {
  if (!url.pathname.startsWith('/api/')) return false;

  if (url.pathname === '/api/quotes') {
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').slice(0, 50).map((s) => s.trim()).filter(Boolean);
    const invalid = symbols.find((s) => !SYMBOL_RE.test(s));
    if (invalid) { sendJson(res, 400, { error: 'invalid symbol' }); return true; }
    handleQuotes(symbols.join(','))
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return true;
  }
  if (url.pathname === '/api/history') {
    const symbol = url.searchParams.get('symbol');
    const range = url.searchParams.get('range') ?? '1mo';
    const interval = url.searchParams.get('interval') ?? '1d';
    if (!symbol) { sendJson(res, 400, { error: 'symbol required' }); return true; }
    if (!SYMBOL_RE.test(symbol)) { sendJson(res, 400, { error: 'invalid symbol' }); return true; }
    if (!VALID_RANGES.has(range)) { sendJson(res, 400, { error: 'invalid range' }); return true; }
    if (!VALID_INTERVALS.has(interval)) { sendJson(res, 400, { error: 'invalid interval' }); return true; }
    handleHistory(symbol, range, interval)
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return true;
  }
  if (url.pathname === '/api/price') {
    const symbol = url.searchParams.get('symbol');
    const date = url.searchParams.get('date');
    if (!symbol || !date) { sendJson(res, 400, { error: 'symbol and date required' }); return true; }
    if (!SYMBOL_RE.test(symbol)) { sendJson(res, 400, { error: 'invalid symbol' }); return true; }
    if (!DATE_RE.test(date)) { sendJson(res, 400, { error: 'invalid date' }); return true; }
    handlePriceOnDate(symbol, date)
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return true;
  }
  sendJson(res, 404, { error: 'not found' });
  return true;
}
