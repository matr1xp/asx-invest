import type { Instrument } from '../types';

export const INSTRUMENTS: Instrument[] = [
  // High-yield ETFs
  {
    symbol: 'VHY', name: 'Vanguard Aust. High Yield', category: 'high-yield-etf',
    cashYield: 5.0, grossYield: 7.1, mer: 0.25, franking: 'Fully', focus: 'High-yield ASX shares',
    description: 'Tracks the FTSE Australia High Dividend Yield Index, investing in ASX-listed companies that have higher forecast dividends relative to the broader market, weighted by dividend yield.',
  },
  {
    symbol: 'A200', name: 'BetaShares Australia 200', category: 'high-yield-etf',
    cashYield: 4.0, grossYield: 5.7, mer: 0.07, franking: 'Fully', focus: 'Broad ASX top 200',
    description: 'Tracks the Solactive Australia 200 Index, providing exposure to the 200 largest companies by market capitalisation listed on the ASX at a very low management cost.',
  },
  {
    symbol: 'MVW', name: 'VanEck Aust. Equal Weight', category: 'high-yield-etf',
    cashYield: 4.2, grossYield: 6.0, mer: 0.35, franking: 'Fully', focus: 'Equal-weight ASX 100',
    description: 'Tracks the MVIS Australia Equal Weight Index, investing in Australia\'s largest and most liquid ASX-listed companies with each constituent weighted equally rather than by market capitalisation, resulting in greater sector diversification.',
  },
  {
    symbol: 'IHD', name: 'iShares Aust. Div. Opportunities', category: 'high-yield-etf',
    cashYield: 3.8, grossYield: 5.4, mer: 0.30, franking: 'Fully', focus: 'Growing dividend history',
    description: 'Tracks the S&P/ASX Sustainability Screened Dividend Opportunities Index, investing in approximately 50 ASX-listed stocks that offer high dividend yields while meeting diversification, profitability, and ESG screening requirements.',
  },
  {
    symbol: 'SYI', name: 'SPDR S&P/ASX Dividends', category: 'high-yield-etf',
    cashYield: 5.5, grossYield: 7.5, mer: 0.35, franking: 'Fully', focus: 'MSCI Select High Dividend Yield, excl. REITs',
    description: 'Tracks the MSCI Australia Select High Dividend Yield Index, investing in Australian companies with relatively high dividend income and quality characteristics, explicitly excluding REITs from the portfolio.',
  },
  {
    symbol: 'VAP', name: 'Vanguard Aust. Property Sec.', category: 'high-yield-etf',
    cashYield: 4.5, mer: 0.23, franking: 'Unfranked', focus: 'Diversified A-REIT exposure',
    description: 'Tracks the S&P/ASX 300 A-REIT Index, providing exposure to Australian real estate investment trusts across retail, office, industrial, and diversified property sectors.',
  },
  // Growth & diversified ETFs
  {
    symbol: 'VAS', name: 'Vanguard Australian Shares', category: 'growth-etf',
    mer: 0.07, franking: 'Fully', focus: 'Broad ASX 300',
    description: 'Tracks the S&P/ASX 300 Index, giving investors low-cost exposure to the 300 largest companies listed on the Australian Securities Exchange, weighted by market capitalisation.',
  },
  {
    symbol: 'VGS', name: 'Vanguard MSCI Intl Shares', category: 'growth-etf',
    mer: 0.18, franking: 'Unfranked', focus: 'Global developed markets',
    description: 'Tracks the MSCI World ex-Australia Index, providing exposure to approximately 1,300 large and mid-cap companies across developed markets in North America, Europe, and Asia, excluding Australia.',
  },
  {
    symbol: 'VDHG', name: 'Vanguard Diversified High Growth', category: 'growth-etf',
    mer: 0.27, focus: 'Multi-asset high growth',
    description: 'A multi-asset fund investing in a mix of Vanguard\'s underlying index funds, targeting roughly 90% growth assets (global and Australian shares) and 10% defensive assets (bonds), designed for investors seeking long-term capital growth.',
  },
  {
    symbol: 'DHHF', name: 'BetaShares Diversified All Growth', category: 'growth-etf',
    mer: 0.19, focus: 'Multi-asset 100% growth',
    description: 'A diversified all-in-one ETF investing across a portfolio of BetaShares index funds covering Australian shares, international developed markets, and emerging markets, with 100% allocation to growth assets and no defensive component.',
  },
  {
    symbol: 'ACDC', name: 'Global X Battery Tech & Lithium', category: 'growth-etf',
    mer: 0.69, focus: 'Battery / lithium thematic',
    description: 'Provides exposure to global companies involved in battery technology and lithium, spanning the full supply chain from lithium mining and refining through to battery cell production, supporting the electrification and energy transition megatrend.',
  },
  {
    symbol: 'ESGI', name: 'VanEck MSCI Intl Sustainable', category: 'growth-etf',
    mer: 0.55, focus: 'International ESG equity',
    description: 'Tracks the MSCI World ex Australia ex Fossil Fuel Select SRI and Low Carbon Capped Index, investing in international developed-market companies that score highly on ESG criteria while excluding fossil fuel producers.',
  },
  // Bond / cash ETFs
  {
    symbol: 'AGVT', name: 'BetaShares Aust. Govt Bond', category: 'bond-etf',
    cashYield: 4.1, mer: 0.22, focus: 'Govt bonds, monthly income',
    description: 'Tracks an index of high-quality bonds issued by Australian federal and state governments, as well as supranational and sovereign agencies, with a focus on longer-duration maturities of 7–12 years.',
  },
  {
    symbol: 'VAF', name: 'Vanguard Aust. Fixed Interest', category: 'bond-etf',
    cashYield: 4.5, mer: 0.20, focus: 'Broad bonds',
    description: 'Tracks the Bloomberg AusBond Composite 0+ Yr Index, investing in investment-grade Australian dollar-denominated bonds issued by governments, government-related entities, and corporate issuers.',
  },
  {
    symbol: 'IAF', name: 'iShares Core Composite Bond', category: 'bond-etf',
    cashYield: 4.4, mer: 0.15, focus: 'Composite bond',
    description: 'Tracks the Bloomberg AusBond Composite 0+ Yr Index, providing broad exposure to the Australian investment-grade bond market, including government, semi-government, supranational, and corporate bonds.',
  },
  {
    symbol: 'AAA', name: 'BetaShares Aust. High Int. Cash', category: 'bond-etf',
    cashYield: 4.8, mer: 0.18, focus: 'Cash-like, daily liquidity',
    description: 'Invests in Australian dollar interest-bearing bank deposit accounts held with major financial institutions, aiming to deliver a higher yield than cash management accounts while maintaining capital security.',
  },
  {
    symbol: 'RCB', name: 'Russell Aust. Select Corp Bond', category: 'bond-etf',
    cashYield: 5.1, mer: 0.28, focus: 'Corporate credit',
    description: 'Tracks the DBIQ 0–4 Year Investment Grade Australian Corporate Bond Index, investing in the largest and most liquid Australian corporate bonds with a minimum credit rating of A and maturities of up to four years.',
  },
  // Blue-chip shares
  {
    symbol: 'CBA', name: 'Commonwealth Bank', category: 'blue-chip',
    cashYield: 4.5, grossYield: 6.4, franking: 'Fully', focus: 'Banking',
    description: 'Australia\'s largest bank by market capitalisation, providing retail and business banking, home loans, insurance, and investment services predominantly to customers in Australia and New Zealand through its ASB subsidiary.',
  },
  {
    symbol: 'NAB', name: 'National Australia Bank', category: 'blue-chip',
    cashYield: 5.5, grossYield: 7.9, franking: 'Fully', focus: 'Banking',
    description: 'One of Australia\'s four major banks, serving over 8.5 million personal, business, and institutional customers across Australia and New Zealand with lending, deposit, and transaction services.',
  },
  {
    symbol: 'ANZ', name: 'ANZ Group', category: 'blue-chip',
    cashYield: 6.0, grossYield: 8.6, franking: 'Fully', focus: 'Banking',
    description: 'One of Australia\'s four major banks, offering personal banking, business banking, and institutional financial services across approximately 30 markets, with a significant presence in Australia, New Zealand, and Asia.',
  },
  {
    symbol: 'WBC', name: 'Westpac', category: 'blue-chip',
    cashYield: 5.8, grossYield: 8.3, franking: 'Fully', focus: 'Banking',
    description: 'One of Australia\'s oldest and largest banks, providing personal, business, and corporate banking products and services — including home loans, transaction accounts, and insurance — to customers across Australia.',
  },
  {
    symbol: 'BHP', name: 'BHP Group', category: 'blue-chip',
    cashYield: 5.2, grossYield: 7.4, franking: 'Fully', focus: 'Resources',
    description: 'One of the world\'s largest mining companies, producing iron ore, copper, and metallurgical coal, with major operations in Australia and the Americas and a growing presence in potash through its Jansen project in Canada.',
  },
  {
    symbol: 'WES', name: 'Wesfarmers', category: 'blue-chip',
    cashYield: 3.5, grossYield: 5.0, franking: 'Fully', focus: 'Consumer',
    description: 'A diversified Australian conglomerate operating retail businesses including Bunnings, Kmart, Officeworks, and Target, as well as chemicals, energy, fertilisers, and industrial safety businesses.',
  },
  {
    symbol: 'WOW', name: 'Woolworths', category: 'blue-chip',
    cashYield: 3.8, grossYield: 5.4, franking: 'Fully', focus: 'Consumer staples',
    description: 'Australia\'s largest retailer, operating supermarkets and everyday consumer goods stores across Australia and New Zealand under brands including Woolworths, Everyday Rewards, and BWS, serving approximately 24 million customers each week.',
  },
  {
    symbol: 'TLS', name: 'Telstra', category: 'blue-chip',
    cashYield: 4.8, grossYield: 5.9, franking: 'Partial', focus: 'Telecom',
    description: 'Australia\'s largest telecommunications company, providing mobile, broadband, data, and voice services to consumers, businesses, and government organisations across Australia and in more than 30 countries internationally.',
  },
  // A-REITs
  {
    symbol: 'GMG', name: 'Goodman Group', category: 'a-reit',
    cashYield: 1.5, franking: 'Unfranked', focus: 'Industrial / logistics',
    description: 'A global integrated property group that owns, develops, and manages logistics and industrial real estate — including warehouses and distribution centres — across key gateway markets in the Asia-Pacific, Europe, and the Americas.',
  },
  {
    symbol: 'SCG', name: 'Scentre Group', category: 'a-reit',
    cashYield: 6.5, franking: 'Unfranked', focus: 'Retail (Westfields)',
    description: 'Owns and operates a portfolio of 42 Westfield-branded shopping centres across Australia and New Zealand, with a fully integrated team handling design, construction, leasing, and ongoing management of the assets.',
  },
  {
    symbol: 'CHC', name: 'Charter Hall', category: 'a-reit',
    cashYield: 4.0, franking: 'Partial', focus: 'Diversified / funds mgmt',
    description: 'Australia\'s largest diversified property funds manager, managing listed and unlisted funds on behalf of institutional, wholesale, and retail investors across office, industrial, retail, and social infrastructure sectors.',
  },
  {
    symbol: 'DXS', name: 'Dexus', category: 'a-reit',
    cashYield: 5.8, franking: 'Unfranked', focus: 'Office / industrial',
    description: 'A leading Australasian integrated real asset group that directly owns a portfolio of office, industrial, and alternatives properties and manages approximately $40 billion in third-party capital through its funds management platform.',
  },
  {
    symbol: 'MGR', name: 'Mirvac Group', category: 'a-reit',
    cashYield: 5.0, franking: 'Unfranked', focus: 'Residential dev.',
    description: 'A diversified Australian property group that develops and manages a portfolio of residential, office, industrial, retail, and build-to-rent assets in major Australian cities, combining development expertise with long-term asset ownership.',
  },
  {
    symbol: 'CQR', name: 'Charter Hall Retail REIT', category: 'a-reit',
    cashYield: 6.0, franking: 'Unfranked', focus: 'Convenience retail',
    description: 'Owns and manages a portfolio of Australian supermarket-anchored convenience shopping centres focused on non-discretionary everyday retail, with properties concentrated in eastern Australia and high-growth regions of Western Australia and Queensland.',
  },
];

export const CATEGORY_LABELS: Record<Instrument['category'], string> = {
  'high-yield-etf': 'High-Yield ETFs',
  'growth-etf': 'Growth & Diversified ETFs',
  'bond-etf': 'Bond & Cash ETFs',
  'blue-chip': 'Blue-Chip Shares',
  'a-reit': 'A-REITs',
};
