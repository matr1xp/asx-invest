import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InstrumentCard } from './InstrumentCard';
import type { Instrument, Quote } from '../../types';

const inst: Instrument = { symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf', cashYield: 5 };

function renderCard(quote?: Quote, isFavorite = false, onToggleFavorite?: (s: string) => void) {
  return render(
    <MemoryRouter>
      <InstrumentCard instrument={inst} quote={quote} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite ?? vi.fn()} />
    </MemoryRouter>,
  );
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
  it('renders a star button', () => {
    renderCard(undefined);
    expect(screen.getByLabelText(/add to favorites/i)).toBeInTheDocument();
  });
  it('shows filled star when favorited', () => {
    renderCard(undefined, true);
    expect(screen.getByLabelText(/remove from favorites/i)).toBeInTheDocument();
  });
  it('calls onToggleFavorite when star is clicked', () => {
    const onToggle = vi.fn();
    renderCard(undefined, false, onToggle);
    fireEvent.click(screen.getByLabelText(/add to favorites/i));
    expect(onToggle).toHaveBeenCalledWith('VHY');
  });
});