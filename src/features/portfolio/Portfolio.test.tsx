import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Portfolio } from './Portfolio';

vi.mock('../../api/hooks', () => ({
  useQuotes: () => ({ data: { VHY: { symbol: 'VHY', price: 70, prevClose: 69, change: 1, changePct: 1.4, volume: 1, currency: 'AUD', spark: [69, 70] } } }),
}));

describe('Portfolio', () => {
  beforeEach(() => localStorage.clear());

  it('shows an empty state initially', () => {
    render(<Portfolio />);
    expect(screen.getByText(/no holdings/i)).toBeInTheDocument();
  });

  it('adds a holding and shows its live value', async () => {
    const user = userEvent.setup();
    render(<Portfolio />);
    await user.selectOptions(screen.getByLabelText(/symbol/i), 'VHY');
    await user.type(screen.getByLabelText(/units/i), '100');
    await user.type(screen.getByLabelText(/buy price/i), '65');
    await user.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('$7,000.00')).toBeInTheDocument();
  });
});
