import { describe, it, expect } from 'vitest';
import { INSTRUMENTS } from './instruments';

describe('INSTRUMENTS', () => {
  it('has 29 unique symbols', () => {
    const symbols = INSTRUMENTS.map((i) => i.symbol);
    expect(symbols).toHaveLength(29);
    expect(new Set(symbols).size).toBe(29);
  });

  it('includes the user-added growth ETFs', () => {
    const growth = INSTRUMENTS.filter((i) => i.category === 'growth-etf').map((i) => i.symbol);
    expect(growth.sort()).toEqual(['ACDC', 'ESGI', 'VAS', 'VDHG', 'VGS']);
  });

  it('every instrument has a name and category', () => {
    for (const i of INSTRUMENTS) {
      expect(i.name.length).toBeGreaterThan(0);
      expect(i.category).toBeTruthy();
    }
  });
});
