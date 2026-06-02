import { describe, it, expect } from 'vitest';
import { estimateIncome } from './income';

describe('estimateIncome', () => {
  it('computes fully franked income at a 32.5% rate', () => {
    // $50,000 at 5% cash, fully franked
    const r = estimateIncome({ amount: 50000, cashYieldPct: 5, franking: 'Fully', marginalRatePct: 32.5 });
    expect(r.cashIncome).toBe(2500);
    expect(r.frankingCredit).toBeCloseTo(2500 * (0.30 / 0.70), 4); // ≈ 1071.43
    const grossed = 2500 + 2500 * (0.30 / 0.70);
    const tax = grossed * 0.325;
    expect(r.netIncome).toBeCloseTo(2500 - tax + 2500 * (0.30 / 0.70), 2);
  });

  it('unfranked income has no franking credit', () => {
    const r = estimateIncome({ amount: 10000, cashYieldPct: 4, franking: 'Unfranked', marginalRatePct: 37 });
    expect(r.cashIncome).toBe(400);
    expect(r.frankingCredit).toBe(0);
    expect(r.netIncome).toBeCloseTo(400 - 400 * 0.37, 2);
  });
});
