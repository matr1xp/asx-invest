import { useMemo, useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import { useQuotes } from '../../api/hooks';
import { loadHoldings, saveHoldings, holdingMetrics, type Holding } from '../../store/portfolio';
import { fmtCurrency, fmtSignedPct } from '../../lib/format';
import { HoldingForm } from './HoldingForm';

export function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>(() => loadHoldings());
  const symbols = useMemo(() => INSTRUMENTS.map((i) => i.symbol), []);
  const { data: quotes } = useQuotes(symbols);

  function update(next: Holding[]) { setHoldings(next); saveHoldings(next); }
  function add(h: Holding) { update([...holdings, h]); }
  function remove(idx: number) { update(holdings.filter((_, i) => i !== idx)); }

  return (
    <div>
      <h1>Portfolio</h1>
      <HoldingForm onAdd={add} />
      {holdings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No holdings yet — add one above to track its live value.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '.78rem' }}>
            <th>Symbol</th><th>Units</th><th>Buy</th><th>Price</th><th>Value</th><th>Gain</th><th>Income/yr</th><th></th>
          </tr></thead>
          <tbody>
            {holdings.map((h, idx) => {
              const inst = INSTRUMENTS.find((i) => i.symbol === h.symbol);
              const price = quotes?.[h.symbol]?.price;
              const m = holdingMetrics(h, price, inst?.cashYield);
              return (
                <tr key={idx} style={{ borderTop: '1px solid var(--border)', fontFamily: 'var(--mono)' }}>
                  <td>{h.symbol}</td><td>{h.units}</td><td>{fmtCurrency(h.buyPrice)}</td>
                  <td>{fmtCurrency(price)}</td><td>{fmtCurrency(m.value)}</td>
                  <td style={{ color: (m.gain ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {fmtCurrency(m.gain)} ({fmtSignedPct(m.gainPct)})
                  </td>
                  <td>{fmtCurrency(m.annualIncome)}</td>
                  <td><button onClick={() => remove(idx)}>✕</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
