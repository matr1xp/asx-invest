import { describe, it, expect, vi, afterEach } from 'vitest';
import { normaliseQuote, normaliseHistory, chartUrl, periodRange, priceHistoryUrl, pickLastClose } from './yahoo';

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

  it('builds a period range covering the target date with a lookback window', () => {
    const { period1, period2 } = periodRange('2024-01-15');
    // period2 is just past end-of-day on the target; period1 is ~16 days earlier.
    expect(period2).toBeGreaterThan(period1);
    expect(period2 - period1).toBe(16 * 86400);
    // period2 sits on/after 2024-01-15T23:59:59Z
    expect(period2).toBeGreaterThanOrEqual(Math.floor(Date.parse('2024-01-15T23:59:59Z') / 1000));
  });

  it('builds a period-based history URL with .AX and daily interval', () => {
    expect(priceHistoryUrl('VHY', 100, 200)).toBe(
      'https://query1.finance.yahoo.com/v8/finance/chart/VHY.AX?period1=100&period2=200&interval=1d',
    );
  });

  it('picks the most recent close from a history payload (on or before the date)', () => {
    expect(pickLastClose(sample)).toBe(70.5);
    expect(pickLastClose({ chart: { result: [{ timestamp: [], indicators: { quote: [{}] } }] } })).toBeNull();
  });
});
