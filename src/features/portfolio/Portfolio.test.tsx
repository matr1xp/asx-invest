import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Portfolio } from './Portfolio';

vi.mock('../../api/hooks', () => ({
  useQuotes: () => ({ data: { VHY: { symbol: 'VHY', price: 70, prevClose: 69, change: 1, changePct: 1.4, volume: 1, currency: 'AUD', spark: [69, 70] } } }),
  // No auto-fill in tests, so the manually typed buy price stands.
  usePriceOnDate: () => ({ data: undefined, isFetching: false }),
}));

describe('Portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('shows an empty state initially', () => {
    render(<Portfolio />);
    expect(screen.getByText(/no holdings/i)).toBeInTheDocument();
  });

  it('adds a holding by amount invested and shows invested + live value', async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    // $500 invested at an ASX buy price of $50 → 10 units; live price $70 → value $700.
    await user.selectOptions(screen.getByLabelText(/symbol/i), 'VHY');
    await user.type(screen.getByLabelText(/amount/i), '500');
    await user.type(screen.getByLabelText(/buy price/i), '50');
    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // invested / cost
    expect(screen.getByText('$700.00')).toBeInTheDocument(); // live value
  });
});
