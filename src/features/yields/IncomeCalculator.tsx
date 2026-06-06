import { useState } from 'react';
import { estimateIncome } from '../../lib/income';
import type { Instrument } from '../../types';
import { fmtCurrency } from '../../lib/format';

const RATES = [0, 19, 32.5, 37, 47, 15];

export function IncomeCalculator() {
  const [amount, setAmount] = useState(50000);
  const [yieldPct, setYieldPct] = useState(5);
  const [franking, setFranking] = useState<Instrument['franking']>('Fully');
  const [rate, setRate] = useState(32.5);

  const r = estimateIncome({ amount, cashYieldPct: yieldPct, franking, marginalRatePct: rate });

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', marginTop: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Income Calculator</h2>
      <div className="income-calc-form">
        <label>Amount (A$)<input aria-label="amount" type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} /></label>
        <label>Cash yield %<input aria-label="yield" type="number" value={yieldPct} onChange={(e) => setYieldPct(+e.target.value)} /></label>
        <label>Franking
          <select aria-label="franking" value={franking} onChange={(e) => setFranking(e.target.value as Instrument['franking'])}>
            <option value="Fully">Fully</option><option value="Partial">Partial</option><option value="Unfranked">Unfranked</option>
          </select>
        </label>
        <label>Marginal rate %
          <select aria-label="rate" value={rate} onChange={(e) => setRate(+e.target.value)}>
            {RATES.map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'grid', gap: '.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', marginTop: '1rem' }}>
        <Out label="Cash income" value={fmtCurrency(r.cashIncome)} />
        <Out label="Franking credit" value={fmtCurrency(r.frankingCredit)} />
        <Out label="Grossed income" value={fmtCurrency(r.grossedIncome)} />
        <Out label="Net after tax" value={fmtCurrency(r.netIncome)} />
      </div>
    </div>
  );
}

function Out({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: 'var(--gold)', fontSize: '1.15rem' }}>{value}</div>
    </div>
  );
}
