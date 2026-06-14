import { Link } from 'react-router-dom';
import type { Instrument, Quote } from '../../types';
import { fmtCurrency } from '../../lib/format';
import { ChangeBadge } from '../../components/ChangeBadge';
import { Sparkline } from '../../components/Sparkline';

export function InstrumentCard({
  instrument,
  quote,
  isFavorite = false,
  onToggleFavorite,
}: {
  instrument: Instrument;
  quote?: Quote;
  isFavorite?: boolean;
  onToggleFavorite?: (symbol: string) => void;
}) {
  const up = (quote?.change ?? 0) >= 0;
  return (
    <div
      style={{ position: 'relative', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1rem' }}
    >
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(instrument.symbol); }}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        style={{
          position: 'absolute', top: '.65rem', right: '.65rem',
          background: 'none', border: 'none', cursor: 'pointer', padding: '.15rem',
          lineHeight: 1, zIndex: 2,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24"
          fill={isFavorite ? 'var(--gold)' : 'none'}
          stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
      <Link to={`/instrument/${instrument.symbol}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: '1.5rem' }}>
          <strong>{instrument.symbol}</strong>
          <ChangeBadge changePct={quote?.changePct} />
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: '.15rem 0 .5rem' }}>
          {instrument.name}
        </div>
        {quote ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--mono)' }}>
              {fmtCurrency(quote.price)}
            </span>
            <Sparkline data={quote.spark} up={up} />
          </div>
        ) : (
          <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Price unavailable</div>
        )}
      </Link>
    </div>
  );
}