import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InstrumentCard } from './InstrumentCard';
import type { Instrument, Quote } from '../../types';

const inst: Instrument = { symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf', cashYield: 5 };

function renderCard(quote?: Quote) {
  return render(<MemoryRouter><InstrumentCard instrument={inst} quote={quote} /></MemoryRouter>);
}

describe('InstrumentCard', () => {
  it('renders the live price when a quote is present', () => {
    renderCard({ symbol: 'VHY', price: 70.5, prevClose: 70, change: 0.5, changePct: 0.71, volume: 1, currency: 'AUD', spark: [70, 70.5] });
    expect(screen.getByText('$70.50')).toBeInTheDocument();
    expect(screen.getByText('VHY')).toBeInTheDocument();
  });
  it('shows "price unavailable" when no quote', () => {
    renderCard(undefined);
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});
