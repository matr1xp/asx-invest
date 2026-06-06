import type { Connect } from 'vite';
import type { IncomingMessage } from 'node:http';
import { TtlCache } from './cache';
import { fetchChart, fetchPriceOnDate, normaliseQuote, normaliseHistory, type Quote, type Candle } from './yahoo';

const SYMBOL_RE = /^[A-Z0-9]{1,10}$/;
const VALID_RANGES = new Set(['1d','5d','1mo','3mo','6mo','1y','2y','5y','10y','ytd','max']);
const VALID_INTERVALS = new Set(['1m','5m','15m','1d','1wk','1mo']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const quoteCache = new TtlCache<Quote>(60_000);
const historyCache = new TtlCache<Candle[]>(15 * 60_000);
const priceOnDateCache = new TtlCache<number | null>(60 * 60_000); // historical prices are stable

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

function sendJson(res: Parameters<Connect.NextHandleFunction>[1], status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export const apiMiddleware: Connect.NextHandleFunction = (req: IncomingMessage, res, next) => {
  const url = new URL(req.url ?? '', 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return next();

  if (url.pathname === '/api/quotes') {
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').slice(0, 50).map((s) => s.trim()).filter(Boolean);
    const invalid = symbols.find((s) => !SYMBOL_RE.test(s));
    if (invalid) return sendJson(res, 400, { error: 'invalid symbol' });
    handleQuotes(symbols.join(','))
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return;
  }
  if (url.pathname === '/api/history') {
    const symbol = url.searchParams.get('symbol');
    const range = url.searchParams.get('range') ?? '1mo';
    const interval = url.searchParams.get('interval') ?? '1d';
    if (!symbol) return sendJson(res, 400, { error: 'symbol required' });
    if (!SYMBOL_RE.test(symbol)) return sendJson(res, 400, { error: 'invalid symbol' });
    if (!VALID_RANGES.has(range)) return sendJson(res, 400, { error: 'invalid range' });
    if (!VALID_INTERVALS.has(interval)) return sendJson(res, 400, { error: 'invalid interval' });
    handleHistory(symbol, range, interval)
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return;
  }
  if (url.pathname === '/api/price') {
    const symbol = url.searchParams.get('symbol');
    const date = url.searchParams.get('date');
    if (!symbol || !date) return sendJson(res, 400, { error: 'symbol and date required' });
    if (!SYMBOL_RE.test(symbol)) return sendJson(res, 400, { error: 'invalid symbol' });
    if (!DATE_RE.test(date)) return sendJson(res, 400, { error: 'invalid date' });
    handlePriceOnDate(symbol, date)
      .then((data) => sendJson(res, 200, data))
      .catch((e) => { console.error('[api]', req.url, e); sendJson(res, 502, { error: 'upstream fetch failed' }); });
    return;
  }
  return sendJson(res, 404, { error: 'not found' });
};
