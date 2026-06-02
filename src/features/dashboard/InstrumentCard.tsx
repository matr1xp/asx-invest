import { Link } from 'react-router-dom';
import type { Instrument, Quote } from '../../types';
import { fmtCurrency } from '../../lib/format';
import { ChangeBadge } from '../../components/ChangeBadge';
import { Sparkline } from '../../components/Sparkline';

export function InstrumentCard({ instrument, quote }: { instrument: Instrument; quote?: Quote }) {
  const up = (quote?.change ?? 0) >= 0;
  return (
    <Link to={`/instrument/${instrument.symbol}`}
      style={{ display: 'block', background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
  );
}
