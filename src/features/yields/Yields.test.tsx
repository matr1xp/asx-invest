import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Yields } from './Yields';

vi.mock('../../api/hooks', () => ({
  useQuotes: () => ({ data: { VHY: { symbol: 'VHY', price: 70, prevClose: 69, change: 1, changePct: 1.4, volume: 1, currency: 'AUD', spark: [69, 70] } } }),
}));

describe('Yields', () => {
  it('renders a row per instrument with live price merged in', () => {
    render(<Yields />);
    expect(screen.getByText('VHY')).toBeInTheDocument();
    expect(screen.getByText('$70.00')).toBeInTheDocument();
    expect(screen.getByText(/Income Calculator/i)).toBeInTheDocument();
  });
});
