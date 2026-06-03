import { useQuery } from '@tanstack/react-query';
import { fetchQuotes, fetchHistory, fetchPriceOn } from './client';
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

export function usePriceOnDate(symbol: string, date: string) {
  return useQuery({
    queryKey: ['price-on', symbol, date],
    queryFn: () => fetchPriceOn(symbol, date),
    enabled: Boolean(symbol && date),
    staleTime: 60 * 60 * 1000,
  });
}
