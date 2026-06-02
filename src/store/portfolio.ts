export interface Holding { symbol: string; units: number; buyPrice: number; }
export interface HoldingMetrics {
  cost: number;
  value?: number; gain?: number; gainPct?: number; annualIncome?: number;
}

const KEY = 'asx-portfolio';

export function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Holding[]) : [];
  } catch {
    return [];
  }
}

export function saveHoldings(holdings: Holding[]): void {
  localStorage.setItem(KEY, JSON.stringify(holdings));
}

export function holdingMetrics(h: Holding, price: number | undefined, cashYieldPct: number | undefined): HoldingMetrics {
  const cost = h.units * h.buyPrice;
  if (price == null) return { cost };
  const value = h.units * price;
  return {
    cost,
    value,
    gain: value - cost,
    gainPct: cost ? ((value - cost) / cost) * 100 : 0,
    annualIncome: cashYieldPct != null ? value * (cashYieldPct / 100) : undefined,
  };
}
