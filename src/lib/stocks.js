export const STOCKS = Object.freeze([
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy', basePrice: 2945.50 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 4120.30 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', basePrice: 1680.20 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', basePrice: 1865.40 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', basePrice: 1240.80 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', basePrice: 1605.60 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 845.30 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', basePrice: 465.70 },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Construction', basePrice: 3625.90 },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', basePrice: 1145.60 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', basePrice: 1785.40 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', basePrice: 2465.30 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automobile', basePrice: 12680.50 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer Goods', basePrice: 2915.80 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', basePrice: 545.60 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile', basePrice: 985.40 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharmaceuticals', basePrice: 1720.30 },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer Goods', basePrice: 3385.70 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Materials', basePrice: 11450.20 },
  { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'FMCG', basePrice: 2540.60 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financial Services', basePrice: 7245.80 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Energy', basePrice: 325.40 },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Energy', basePrice: 365.70 },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT', basePrice: 1845.30 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Energy', basePrice: 285.60 },
  { symbol: 'COALINDIA', name: 'Coal India', sector: 'Energy', basePrice: 415.80 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Infrastructure', basePrice: 3120.50 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Materials', basePrice: 945.30 },
  { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'IT', basePrice: 1665.40 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile', basePrice: 2945.60 }
]);

export const SECTORS = Object.freeze(
  [...new Set(STOCKS.map((asset) => asset.sector))].sort()
);
export const STOCKS_MAP = Object.freeze(
  STOCKS.reduce((accumulator, currentAsset) => {
    accumulator[currentAsset.symbol] = currentAsset;
    return accumulator;
  }, {})
);