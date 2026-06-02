import { describe, it, expect } from 'vitest';
import { fmtCurrency, fmtPct, fmtSignedPct } from './format';

describe('format', () => {
  it('formats AUD currency', () => { expect(fmtCurrency(1234.5)).toBe('$1,234.50'); });
  it('formats a percent', () => { expect(fmtPct(5)).toBe('5.00%'); });
  it('formats a signed percent', () => {
    expect(fmtSignedPct(2.5)).toBe('+2.50%');
    expect(fmtSignedPct(-2.5)).toBe('-2.50%');
  });
  it('renders a dash for undefined', () => { expect(fmtPct(undefined)).toBe('—'); });
});
