import { describe, it, expect, beforeEach } from 'vitest';
import { loadHoldings, saveHoldings, holdingMetrics, type Holding } from './portfolio';

describe('portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('persists and reloads holdings', () => {
    const h: Holding[] = [{ symbol: 'VHY', units: 100, buyPrice: 65 }];
    saveHoldings(h);
    expect(loadHoldings()).toEqual(h);
  });

  it('returns empty array when nothing stored', () => {
    expect(loadHoldings()).toEqual([]);
  });

  it('computes value, gain/loss and income', () => {
    const m = holdingMetrics({ symbol: 'VHY', units: 100, buyPrice: 65 }, 70, 5);
    expect(m.value).toBe(7000);
    expect(m.cost).toBe(6500);
    expect(m.gain).toBe(500);
    expect(m.gainPct).toBeCloseTo((500 / 6500) * 100, 5);
    expect(m.annualIncome).toBe(7000 * 0.05);
  });

  it('handles a missing live price (price undefined) without NaN', () => {
    const m = holdingMetrics({ symbol: 'VHY', units: 100, buyPrice: 65 }, undefined, 5);
    expect(m.value).toBeUndefined();
    expect(m.gain).toBeUndefined();
  });
});
