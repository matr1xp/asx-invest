import type { Connect } from 'vite';
import type { IncomingMessage } from 'node:http';
import { TtlCache } from './cache';
import { fetchChart, fetchPriceOnDate, normaliseQuote, normaliseHistory, type Quote, type Candle } from './yahoo';

const quoteCache = new TtlCache<Quote>(60_000);
const historyCache = new TtlCache<Candle[]>(15 * 60_000);
const priceOnDateCache = new TtlCache<number | null>(60 * 60_000); // historical prices are stable

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
  if (url.pathname === '/api/price') {
    const symbol = url.searchParams.get('symbol');
    const date = url.searchParams.get('date');
    if (!symbol || !date) return sendJson(res, 400, { error: 'symbol and date required' });
    handlePriceOnDate(symbol, date)
      .then((data) => sendJson(res, 200, data))
      .catch((e) => sendJson(res, 502, { error: String(e) }));
    return;
  }
  return sendJson(res, 404, { error: 'not found' });
};
