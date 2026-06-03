// A holding is recorded as the dollar amount invested plus the ASX price per
// unit at purchase. Units are derived (amountInvested / buyPrice), which suits
// fractional/micro investing (e.g. Pearler Micro) where you think in dollars
// invested rather than whole share units.
export interface Holding { symbol: string; amountInvested: number; buyPrice: number; date?: string; }
export interface HoldingMetrics {
  cost: number;          // = amountInvested
  units: number;         // derived: amountInvested / buyPrice
  value?: number; gain?: number; gainPct?: number; annualIncome?: number;
}

const KEY = 'asx-portfolio';

function isHolding(x: unknown): x is Holding {
  return (
    typeof x === 'object' && x !== null &&
    typeof (x as Holding).symbol === 'string' &&
    typeof (x as Holding).amountInvested === 'number' &&
    typeof (x as Holding).buyPrice === 'number'
  );
}

export function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Discard anything that isn't the current amount-invested shape (e.g. the
    // legacy { units, buyPrice } schema), which would otherwise mis-render.
    return Array.isArray(parsed) ? parsed.filter(isHolding) : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  localStorage.setItem(KEY, JSON.stringify(holdings));
}

export function holdingMetrics(h: Holding, price: number | undefined, cashYieldPct: number | undefined): HoldingMetrics {
  const cost = h.amountInvested;
  const units = h.buyPrice > 0 ? h.amountInvested / h.buyPrice : 0;
  if (price == null) return { cost, units };
  const value = units * price;
  return {
    cost,
    units,
    value,
    gain: value - cost,
    gainPct: cost ? ((value - cost) / cost) * 100 : 0,
    annualIncome: cashYieldPct != null ? value * (cashYieldPct / 100) : undefined,
  };
}
