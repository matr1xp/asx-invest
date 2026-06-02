import { useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import type { Holding } from '../../store/portfolio';

export function HoldingForm({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(amount); const p = parseFloat(buyPrice);
    if (!a || !p) return;
    onAdd({ symbol, amountInvested: a, buyPrice: p });
    setAmount(''); setBuyPrice('');
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '.5rem' }}>
      <label>Symbol
        <select aria-label="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {INSTRUMENTS.map((i) => <option key={i.symbol} value={i.symbol}>{i.symbol}</option>)}
        </select>
      </label>
      <label>Amount invested ($)
        <input aria-label="amount invested" type="number" step="0.01" min="0" placeholder="500"
          value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label>Buy price (ASX $/unit)
        <input aria-label="buy price" type="number" step="0.0001" min="0" placeholder="178.51"
          value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
