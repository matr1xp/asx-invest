import { useMemo } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import { useQuotes } from '../../api/hooks';
import { fmtCurrency, fmtPct } from '../../lib/format';
import { IncomeCalculator } from './IncomeCalculator';

export function Yields() {
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes } = useQuotes(symbols);

  return (
    <div>
      <h1>Yields &amp; Income</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '.75rem' }}>
            <th>Symbol</th>
            <th className="yields-col-name">Name</th>
            <th>Price</th><th>Cash Yield</th><th>Gross Yield</th><th>MER</th><th>Franking</th>
          </tr></thead>
          <tbody>
            {INSTRUMENTS.map((i) => (
              <tr key={i.symbol} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ fontWeight: 700 }}>{i.symbol}</td>
                <td className="yields-col-name" style={{ color: 'var(--text-muted)' }}>{i.name}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{fmtCurrency(quotes?.[i.symbol]?.price)}</td>
                <td>{fmtPct(i.cashYield)}</td><td>{fmtPct(i.grossYield)}</td>
                <td>{fmtPct(i.mer)}</td><td>{i.franking ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <IncomeCalculator />
    </div>
  );
}
