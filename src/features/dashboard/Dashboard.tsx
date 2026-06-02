import { useMemo, useState } from 'react';
import { INSTRUMENTS, CATEGORY_LABELS } from '../../data/instruments';
import type { Category } from '../../types';
import { useQuotes } from '../../api/hooks';
import { InstrumentCard } from './InstrumentCard';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

export function Dashboard() {
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes, isFetching, dataUpdatedAt } = useQuotes(symbols);
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const shown = INSTRUMENTS.filter((i) => filter === 'all' || i.category === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <button onClick={() => setFilter('all')} style={chip(filter === 'all')}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} style={chip(filter === c)}>{CATEGORY_LABELS[c]}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: 'var(--text-muted)' }}>
          {isFetching ? 'Updating…' : dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ''}
        </span>
      </div>
      {CATEGORIES.filter((c) => filter === 'all' || c === filter).map((c) => {
        const items = shown.filter((i) => i.category === c);
        if (!items.length) return null;
        return (
          <section key={c} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '.95rem', margin: '.5rem 0' }}>{CATEGORY_LABELS[c]}</h2>
            <div style={{ display: 'grid', gap: '.85rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {items.map((i) => <InstrumentCard key={i.symbol} instrument={i} quote={quotes?.[i.symbol]} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function chip(active: boolean): React.CSSProperties {
  return { padding: '.35rem .8rem', borderRadius: 30, border: '1px solid var(--border)', cursor: 'pointer',
    background: active ? 'var(--gold)' : 'transparent', color: active ? 'var(--navy)' : 'var(--text)', fontWeight: 600 };
}
