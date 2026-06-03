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

export async function fetchPriceOn(symbol: string, date: string): Promise<number | null> {
  const res = await fetch(`/api/price?symbol=${symbol}&date=${date}`);
  if (!res.ok) throw new Error(`price ${res.status}`);
  const json = (await res.json()) as { price: number | null };
  return json.price;
}
