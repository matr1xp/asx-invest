import { useEffect, useState } from 'react';
import { INSTRUMENTS } from '../../data/instruments';
import { usePriceOnDate } from '../../api/hooks';
import type { Holding } from '../../store/portfolio';

const today = () => new Date().toISOString().slice(0, 10);

export function HoldingForm({ onAdd }: { onAdd: (h: Holding) => void }) {
  const [symbol, setSymbol] = useState(INSTRUMENTS[0].symbol);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [buyPrice, setBuyPrice] = useState('');

  // Look up the ASX close on the chosen date and default the buy price to it
  // (still editable). Re-defaults whenever the symbol or date changes.
  const { data: priceOnDate, isFetching } = usePriceOnDate(symbol, date);
  useEffect(() => {
    // Round to a clean price (drops Yahoo's long float tail, keeps up to 4 dp).
    if (priceOnDate != null) setBuyPrice(String(Number(priceOnDate.toFixed(4))));
  }, [priceOnDate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = parseFloat(amount); const p = parseFloat(buyPrice);
    if (!a || !p) return;
    onAdd({ symbol, amountInvested: a, buyPrice: p, date });
    setAmount('');
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
      <label>Date bought
        <input aria-label="date bought" type="date" max={today()}
          value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label>Buy price (ASX $/unit)
        <input aria-label="buy price" type="number" step="0.0001" min="0"
          placeholder={isFetching ? 'fetching…' : '178.51'}
          value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}
