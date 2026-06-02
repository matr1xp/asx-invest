import { describe, it, expect, beforeEach } from 'vitest';
import { loadHoldings, saveHoldings, holdingMetrics, type Holding } from './portfolio';

describe('portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('persists and reloads holdings', () => {
    const h: Holding[] = [{ symbol: 'VHY', amountInvested: 500, buyPrice: 50 }];
    saveHoldings(h);
    expect(loadHoldings()).toEqual(h);
  });

  it('returns empty array when nothing stored', () => {
    expect(loadHoldings()).toEqual([]);
  });

  it('drops legacy holdings missing amountInvested', () => {
    // Old schema stored { symbol, units, buyPrice } — incompatible with the
    // amount-invested model, so it must be discarded rather than mis-rendered.
    localStorage.setItem('asx-portfolio', JSON.stringify([{ symbol: 'ACDC', units: 239.7, buyPrice: 2.09 }]));
    expect(loadHoldings()).toEqual([]);
  });

  it('derives units and computes value, gain/loss and income from amount invested', () => {
    // $500 invested at an ASX buy price of $50 → 10 units. Live price $70.
    const m = holdingMetrics({ symbol: 'VHY', amountInvested: 500, buyPrice: 50 }, 70, 5);
    expect(m.units).toBe(10);
    expect(m.cost).toBe(500);
    expect(m.value).toBe(700);
    expect(m.gain).toBe(200);
    expect(m.gainPct).toBeCloseTo(40, 5);
    expect(m.annualIncome).toBe(700 * 0.05);
  });

  it('handles a missing live price (price undefined) without NaN', () => {
    const m = holdingMetrics({ symbol: 'VHY', amountInvested: 500, buyPrice: 50 }, undefined, 5);
    expect(m.cost).toBe(500);
    expect(m.units).toBe(10);
    expect(m.value).toBeUndefined();
    expect(m.gain).toBeUndefined();
  });

  it('guards against a zero buy price (no divide-by-zero NaN)', () => {
    const m = holdingMetrics({ symbol: 'VHY', amountInvested: 500, buyPrice: 0 }, 70, undefined);
    expect(m.units).toBe(0);
    expect(Number.isNaN(m.units)).toBe(false);
    expect(m.value).toBe(0);
  });
});
