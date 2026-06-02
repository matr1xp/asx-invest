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
