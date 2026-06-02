import { useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import type { Holding } from '../../store/portfolio';

export function HoldingForm({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);
  const [units, setUnits] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = parseFloat(units); const p = parseFloat(buyPrice);
    if (!u || !p) return;
    onAdd({ symbol, units: u, buyPrice: p });
    setUnits(''); setBuyPrice('');
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <label>Symbol
        <select aria-label="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {INSTRUMENTS.map((i) => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </label>
      <label>Units
        <input aria-label="units" type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
      </label>
      <label>Buy price
        <input aria-label="buy price" type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
