import { useMemo } from 'react';
import { INSTRUMENTS, CATEGORY_LABELS } from '../../data/instruments';
import type { Category } from '../../types';
import { useQuotes } from '../../api/hooks';
import { InstrumentCard } from '../dashboard/InstrumentCard';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

interface FavoritesProps {
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

export function Favorites({ favorites, onToggleFavorite }: FavoritesProps) {
  const favInstruments = useMemo(
    () => INSTRUMENTS.filter((i) => favorites.includes(i.symbol)),
    [favorites],
  );
  const symbols = useMemo(() => favInstruments.map((i) => i.symbol), [favInstruments]);
  const { data: quotes } = useQuotes(symbols);

  if (favInstruments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '.5rem' }}>
          No favorites yet
        </p>
        <p style={{ fontSize: '.85rem' }}>
          Tap the star icon on any instrument to add it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '.95rem', margin: '.5rem 0' }}>
        Your Favorites ({favInstruments.length})
      </h2>
      <div style={{ display: 'grid', gap: '.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {CATEGORIES.map((c) => {
          const items = favInstruments.filter((i) => i.category === c);
          if (!items.length) return null;
          return items.map((i) => (
            <InstrumentCard
              key={i.symbol}
              instrument={i}
              quote={quotes?.[i.symbol]}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ));
        })}
      </div>
    </div>
  );
}