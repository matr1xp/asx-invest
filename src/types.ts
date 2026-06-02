export type Category = 'high-yield-etf' | 'growth-etf' | 'bond-etf' | 'blue-chip' | 'a-reit';

export interface Instrument {
  symbol: string;
  name: string;
  category: Category;
  cashYield?: number;
  grossYield?: number;
  mer?: number;
  franking?: 'Fully' | 'Partial' | 'Unfranked';
  focus?: string;
}

export interface Quote {
  symbol: string; price: number; prevClose: number;
  change: number; changePct: number; volume: number;
  currency: string; spark: number[];
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number; }
