import type { Instrument } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // High-yield ETFs
  { symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf', cashYield: 5.0, grossYield: 7.1, mer: 0.25, franking: 'Fully', focus: 'High-yield ASX shares' },
  { symbol: 'A200', name: 'BetaShares Australia 200', category: 'high-yield-etf', cashYield: 4.0, grossYield: 5.7, mer: 0.07, franking: 'Fully', focus: 'Broad ASX top 200' },
  { symbol: 'MVW', name: 'VanEck Aust. Equal Weight', category: 'high-yield-etf', cashYield: 4.2, grossYield: 6.0, mer: 0.35, franking: 'Fully', focus: 'Equal-weight ASX 100' },
  { symbol: 'DGRO', name: 'iShares Aust. Div. Growers', category: 'high-yield-etf', cashYield: 3.8, grossYield: 5.4, mer: 0.30, franking: 'Fully', focus: 'Growing dividend history' },
  { symbol: 'SYI', name: 'SPDR S&P/ASX Dividends', category: 'high-yield-etf', cashYield: 5.5, grossYield: 7.5, mer: 0.35, franking: 'Fully', focus: 'Top 50 ASX dividend payers' },
  // Growth & diversified ETFs (user additions; not in guide)
  { symbol: 'VAS', name: 'Vanguard Australian Shares', category: 'growth-etf', mer: 0.07, franking: 'Fully', focus: 'Broad ASX 300' },
  { symbol: 'VGS', name: 'Vanguard MSCI Intl Shares', category: 'growth-etf', mer: 0.18, franking: 'Unfranked', focus: 'Global developed markets' },
  { symbol: 'VDHG', name: 'Vanguard Diversified High Growth', category: 'growth-etf', mer: 0.27, focus: 'Multi-asset high growth' },
  { symbol: 'ACDC', name: 'Global X Battery Tech & Lithium', category: 'growth-etf', mer: 0.69, focus: 'Battery / lithium thematic' },
  { symbol: 'ESGI', name: 'VanEck MSCI Intl Sustainable', category: 'growth-etf', mer: 0.55, focus: 'International ESG equity' },
  // Bond / cash ETFs
  { symbol: 'AGVT', name: 'BetaShares Aust. Govt Bond', category: 'bond-etf', cashYield: 4.1, mer: 0.22, focus: 'Govt bonds, monthly income' },
  { symbol: 'VAF', name: 'Vanguard Aust. Fixed Interest', category: 'bond-etf', cashYield: 4.5, mer: 0.20, focus: 'Broad bonds' },
  { symbol: 'IAF', name: 'iShares Core Composite Bond', category: 'bond-etf', cashYield: 4.4, mer: 0.15, focus: 'Composite bond' },
  { symbol: 'AAA', name: 'BetaShares Aust. High Int. Cash', category: 'bond-etf', cashYield: 4.8, mer: 0.18, focus: 'Cash-like, daily liquidity' },
  { symbol: 'RCB', name: 'Russell Aust. Select Corp Bond', category: 'bond-etf', cashYield: 5.1, mer: 0.28, focus: 'Corporate credit' },
  // Blue-chip shares
  { symbol: 'CBA', name: 'Commonwealth Bank', category: 'blue-chip', cashYield: 4.5, grossYield: 6.4, franking: 'Fully', focus: 'Banking' },
  { symbol: 'NAB', name: 'National Australia Bank', category: 'blue-chip', cashYield: 5.5, grossYield: 7.9, franking: 'Fully', focus: 'Banking' },
  { symbol: 'ANZ', name: 'ANZ Group', category: 'blue-chip', cashYield: 6.0, grossYield: 8.6, franking: 'Fully', focus: 'Banking' },
  { symbol: 'WBC', name: 'Westpac', category: 'blue-chip', cashYield: 5.8, grossYield: 8.3, franking: 'Fully', focus: 'Banking' },
  { symbol: 'BHP', name: 'BHP Group', category: 'blue-chip', cashYield: 5.2, grossYield: 7.4, franking: 'Fully', focus: 'Resources' },
  { symbol: 'WES', name: 'Wesfarmers', category: 'blue-chip', cashYield: 3.5, grossYield: 5.0, franking: 'Fully', focus: 'Consumer' },
  { symbol: 'WOW', name: 'Woolworths', category: 'blue-chip', cashYield: 3.8, grossYield: 5.4, franking: 'Fully', focus: 'Consumer staples' },
  { symbol: 'TLS', name: 'Telstra', category: 'blue-chip', cashYield: 4.8, grossYield: 5.9, franking: 'Partial', focus: 'Telecom' },
  // A-REITs
  { symbol: 'GMG', name: 'Goodman Group', category: 'a-reit', cashYield: 1.5, franking: 'Unfranked', focus: 'Industrial / logistics' },
  { symbol: 'SCG', name: 'Scentre Group', category: 'a-reit', cashYield: 6.5, franking: 'Unfranked', focus: 'Retail (Westfields)' },
  { symbol: 'CHC', name: 'Charter Hall', category: 'a-reit', cashYield: 4.0, franking: 'Partial', focus: 'Diversified / funds mgmt' },
  { symbol: 'DXS', name: 'Dexus', category: 'a-reit', cashYield: 5.8, franking: 'Unfranked', focus: 'Office / industrial' },
  { symbol: 'MGR', name: 'Mirvac Group', category: 'a-reit', cashYield: 5.0, franking: 'Unfranked', focus: 'Residential dev.' },
  { symbol: 'CQR', name: 'Charter Hall Retail REIT', category: 'a-reit', cashYield: 6.0, franking: 'Unfranked', focus: 'Convenience retail' },
];

export const CATEGORY_LABELS: Record<Instrument['category'], string> = {
  'high-yield-etf': 'High-Yield ETFs',
  'growth-etf': 'Growth & Diversified ETFs',
  'bond-etf': 'Bond & Cash ETFs',
  'blue-chip': 'Blue-Chip Shares',
  'a-reit': 'A-REITs',
};
