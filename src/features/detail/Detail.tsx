import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INSTRUMENTS } from '../../data/instruments';
import { useHistory } from '../../api/hooks';
import { fmtPct } from '../../lib/format';
import { PriceChart } from './PriceChart';

const RANGES: { label: string; range: string; interval: string }[] = [
  { label: '1D', range: '1d', interval: '5m' },
  { label: '5D', range: '5d', interval: '30m' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '6M', range: '6mo', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
  { label: '5Y', range: '5y', interval: '1wk' },
  { label: 'All', range: 'max', interval: '1mo' },
];

export function Detail() {
  const { symbol } = useParams();
  const instrument = INSTRUMENTS.find((i) => i.symbol === symbol);
  const [r, setR] = useState(RANGES[2]);
  const { data: candles, isLoading, isError } = useHistory(symbol ?? '', r.range, r.interval);

  if (!instrument) return <div>Unknown symbol. <Link to="/">Back</Link></div>;

  return (
    <div>
      <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>← Dashboard</Link>
      <h1 style={{ margin: '.5rem 0' }}>{instrument.symbol} · {instrument.name}</h1>
      <div style={{ display: 'flex', gap: '.4rem', margin: '.75rem 0' }}>
        {RANGES.map((opt) => (
          <button key={opt.label} onClick={() => setR(opt)}
            style={{ padding: '.3rem .7rem', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--border)', background: opt.label === r.label ? 'var(--gold)' : 'transparent',
              color: opt.label === r.label ? 'var(--navy)' : 'var(--text)' }}>{opt.label}</button>
        ))}
      </div>
      {isLoading && <div style={{ color: 'var(--text-muted)' }}>Loading chart…</div>}
      {isError && <div style={{ color: 'var(--red)' }}>Chart unavailable. <button onClick={() => setR({ ...r })}>Retry</button></div>}
      {candles && candles.length > 0 && <PriceChart candles={candles} />}
      <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginTop: '1.25rem' }}>
        <Stat label="Cash Yield" value={fmtPct(instrument.cashYield)} />
        <Stat label="Gross Yield" value={fmtPct(instrument.grossYield)} />
        <Stat label="MER" value={fmtPct(instrument.mer)} />
        <Stat label="Franking" value={instrument.franking ?? '—'} />
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: '.75rem' }}>{instrument.focus}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '.75rem' }}>
      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '1.1rem' }}>{value}</div>
    </div>
  );
}
