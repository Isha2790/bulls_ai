/**
 * @fileoverview Corporate Knowledge Base Ledger Matrix
 * Unified relational text embeddings dataset providing macro grounding metrics 
 * for localized Information Retrieval-Augmented Generation (RAG) vector scanning pipelines.
 */

export const KNOWLEDGE_BASE = Object.freeze([
  // -------------------------------------------------------------------------
  // 1. Core National Stock Exchange Equity Asset Profiles Baskets
  // -------------------------------------------------------------------------
  { 
    id: 'reliance', 
    type: 'stock', 
    symbol: 'RELIANCE', 
    title: 'Reliance Industries',
    content: "Reliance Industries (RELIANCE) is India's largest private-sector company by revenue, operating across petrochemicals, refining, oil & gas, retail (Reliance Retail), and telecom (Jio). Market cap exceeds ₹20 lakh crore. Key growth drivers: Jio's digital ecosystem, retail expansion, new energy (solar, green hydrogen), and the demerger of Jio Financial Services. The stock is highly sensitive to global oil prices, consumer spending trends, and ARPU growth in telecom. Sector: Energy/Diversified. Index: NIFTY 50, SENSEX." 
  },
  { 
    id: 'tcs', 
    type: 'stock', 
    symbol: 'TCS', 
    title: 'Tata Consultancy Services',
    content: "Tata Consultancy Services (TCS) is India's largest IT services company and a global leader in digital transformation, consulting, and business solutions. Revenue exceeds $28B annually with operating margins of 25%+. Key drivers: cloud migration deals, AI/automation services, BFSI client spending, and North American demand. The stock is sensitive to US IT budgets, visa policies, rupee depreciation (positive), and quarterly deal TCV. Sector: Information Technology. Index: NIFTY 50, SENSEX, NIFTY IT." 
  },
  { 
    id: 'hdfcbank', 
    type: 'stock', 
    symbol: 'HDFCBANK', 
    title: 'HDFC Bank',
    content: "HDFC Bank is India's largest private-sector bank by assets post-merger with HDFC Ltd. It offers retail banking, wholesale banking, and treasury services. The merger created a financial services powerhouse with a combined balance sheet of ₹30+ lakh crore. Key metrics: CASA ratio ~50%, NIM ~3.5%, GNPA ~1.3%. Sensitive to RBI rate decisions, credit growth, and retail loan demand. Sector: Banking. Index: NIFTY 50, SENSEX, NIFTY Bank." 
  },
  { 
    id: 'infosys', 
    type: 'stock', 
    symbol: 'INFY', 
    title: 'Infosys',
    content: "Infosys is India's second-largest IT services company, specializing in digital services, consulting, and AI-powered platforms like Finacle. Revenue ~$18B with margins ~21%. Key drivers: large deal wins, cloud and digital transformation, AI-first strategy with Infosys Topaz. Sensitive to US discretionary spending, visa rules, and guidance revisions. Known for conservative guidance and strong corporate governance. Sector: IT. Index: NIFTY 50, NIFTY IT." 
  },
  { 
    id: 'icicibank', 
    type: 'stock', 
    symbol: 'ICICIBANK', 
    title: 'ICICI Bank',
    content: "ICICI Bank is India's second-largest private-sector bank, offering retail and corporate banking, insurance (ICICI Prudential, ICICI Lombard), and asset management. Strong retail franchise with improving asset quality: GNPA ~1.2%. Key drivers: retail loan growth, digital banking penetration, and improving ROA/ROE. Sensitive to interest rate cycles and credit costs. Sector: Banking. Index: NIFTY 50, NIFTY Bank." 
  },
  { 
    id: 'sbin', 
    type: 'stock', 
    symbol: 'SBIN', 
    title: 'State Bank of India',
    content: "State Bank of India (SBIN) is India's largest public-sector bank by assets, with a network of 22,000+ branches. It offers retail banking, corporate banking, treasury, and subsidiaries in insurance, mutual funds, and cards. GNPA improved to ~2.5% after aggressive provisioning. Key drivers: retail deposits, SLR/G-Sec yields, loan growth, and subsidiary value unlocking. Sensitive to government policy and rate decisions. Sector: Banking (PSU). Index: NIFTY 50, NIFTY Bank, NIFTY PSU Bank." 
  },
  { 
    id: 'bhartiartl', 
    type: 'stock', 
    symbol: 'BHARTIARTL', 
    title: 'Bharti Airtel',
    content: "Bharti Airtel is India's largest telecom operator by revenue, offering mobile, broadband, DTH, and enterprise services across India and 14 African countries. ARPU ~₹200, with strong 5G rollout. Key drivers: tariff hikes, ARPU growth, Africa business profitability, and 5G monetization. Sensitive to competitive intensity (Jio), regulatory decisions (TRAI), and capex cycles. Sector: Telecom. Index: NIFTY 50." 
  },
  { 
    id: 'itc', 
    type: 'stock', 
    symbol: 'ITC', 
    title: 'ITC Limited',
    content: "ITC is a diversified conglomerate with leadership in cigarettes, FMCG, hotels, paperboards, and agri-business. Cigarette business contributes ~40% of revenue with ~80% market share. FMCG is the fastest-growing segment. Key drivers: cigarette volume growth, FMCG margin expansion, hotel industry recovery, and rural demand. The stock is considered a defensive play with high dividend yield (~3%). Sensitive to sin tax changes and rural consumption. Sector: FMCG. Index: NIFTY 50, NIFTY FMCG." 
  },
  { 
    id: 'lt', 
    type: 'stock', 
    symbol: 'LT', 
    title: 'Larsen & Toubro',
    content: "Larsen & Toubro (LT) is India's largest engineering, construction, and infrastructure conglomerate. Core EPC business covers infrastructure, hydrocarbon, power, and defense. Order book exceeds ₹400,000 crore. Key drivers: government infrastructure capex, Middle East hydrocarbon projects, defense orders, and cement business. Sensitive to government capex cycle, commodity prices, and execution pace. Sector: Capital Goods/Construction. Index: NIFTY 50." 
  },
  { 
    id: 'axisbank', 
    type: 'stock', 
    symbol: 'AXISBANK', 
    title: 'Axis Bank',
    content: "Axis Bank is India's third-largest private-sector bank, offering retail and corporate banking. Post-Citi consumer business acquisition, it has strengthened its retail portfolio. GNPA ~1.5%, improving. Key drivers: retail loan growth, fee income, CASA improvement, and credit costs. Sensitive to rate cycles and asset quality in unsecured lending. Sector: Banking. Index: NIFTY 50, NIFTY Bank." 
  },
  { 
    id: 'kotakbank', 
    type: 'stock', 
    symbol: 'KOTAKBANK', 
    title: 'Kotak Mahindra Bank',
    content: "Kotak Mahindra Bank is a private-sector bank known for its conservative lending and strong asset quality. GNPA ~1.8%. The bank offers retail banking, commercial banking, and subsidiaries in life insurance, asset management, and securities. Key drivers: retail deposit growth, loan book expansion, and subsidiary value. Sensitive to RBI regulations and promoter stake dilution. Sector: Banking. Index: NIFTY 50, NIFTY Bank." 
  },
  { 
    id: 'hindunilvr', 
    type: 'stock', 
    symbol: 'HINDUNILVR', 
    title: 'Hindustan Unilever',
    content: "Hindustan Unilever (HINDUNILVR) is India's largest FMCG company by revenue, with brands like Surf Excel, Lifebuoy, Dove, Lux, Lipton, and Knorr. Market share ~75% in soaps and ~50% in detergents. Key drivers: rural demand recovery, premiumization, margin expansion via price hikes, and volume growth. Sensitive to raw material prices (palm oil, crude), rural consumption, and competition. Sector: FMCG. Index: NIFTY 50, NIFTY FMCG." 
  },
  { 
    id: 'maruti', 
    type: 'stock', 
    symbol: 'MARUTI', 
    title: 'Maruti Suzuki',
    content: "Maruti Suzuki is India's largest car manufacturer with ~40%+ market share. Products range from entry-level (Alto) to premium (Grand Vitara). Key drivers: SUV mix improvement, rural demand, export growth, and hybrid/EV strategy. Sensitive to semiconductor availability, commodity prices (steel, aluminum), and passenger vehicle demand cycles. Sector: Automobile. Index: NIFTY 50, NIFTY Auto." 
  },
  { 
    id: 'asianpaint', 
    type: 'stock', 
    symbol: 'ASIANPAINT', 
    title: 'Asian Paints',
    content: "Asian Paints is Asia's largest paint company and India's market leader with ~50% share in decorative paints. The company also operates in home decor (appliance, bath, lighting) and international markets. Key drivers: housing demand, real estate cycle, raw material costs (titanium dioxide, crude derivatives), and premiumization. Sensitive to crude oil prices and construction activity. Sector: Consumer Durables/Paints. Index: NIFTY 50." 
  },
  { 
    id: 'wipro', 
    type: 'stock', 
    symbol: 'WIPRO', 
    title: 'Wipro Limited',
    content: "Wipro is India's third-largest IT services company, offering digital transformation, cloud, cybersecurity, and consulting. Revenue ~$11B with margins ~17%. Key drivers: large deal wins, consulting business recovery, AI-led automation, and healthcare/manufacturing vertical growth. Sensitive to discretionary spending and leadership changes. Known for undergoing multiple restructurings. Sector: IT. Index: NIFTY 50, NIFTY IT." 
  },
  { 
    id: 'tatamotors', 
    type: 'stock', 
    symbol: 'TATAMOTORS', 
    title: 'Tata Motors',
    content: "Tata Motors is India's largest commercial vehicle manufacturer and owner of JLR (Jaguar Land Rover). The PV business has gained ~14% market share with electric vehicles (Nexon EV, Tigor EV, Punch EV, Tiago EV). Key drivers: JLR profitability, CV cycle recovery, EV market leadership in India, and passenger vehicle growth. Sensitive to UK/EU demand, semiconductor supply, and commodity prices. Sector: Automobile. Index: NIFTY 50, NIFTY Auto." 
  },
  { 
    id: 'sunpharma', 
    type: 'stock', 
    symbol: 'SUNPHARMA', 
    title: 'Sun Pharmaceutical',
    content: "Sun Pharma is India's largest pharmaceutical company by revenue, specializing in specialty pharmaceuticals and generics. Key segments: US generics, India formulations, and emerging markets. Specialty pipeline includes Ilumya and Cequa. Key drivers: US specialty revenue, India prescription growth, and margin improvement. Sensitive to US FDA inspections, pricing pressure, and R&D outcomes. Sector: Pharmaceuticals. Index: NIFTY 50, NIFTY Pharma." 
  },
  { 
    id: 'titan', 
    type: 'stock', 
    symbol: 'TITAN', 
    title: 'Titan Company',
    content: "Titan Company is India's largest jewelry retailer (Tanishq, Mia, Zoya) and a leader in watches (Titan, Fastrack) and eyewear (Titan Eye+). Jewelry contributes ~85% of revenue. Key drivers: wedding/festive demand, gold price elasticity, store expansion, and margin management. Sensitive to gold prices, consumer sentiment, and competition from online players. Sector: Consumer/Retail. Index: NIFTY 50." 
  },
  { 
    id: 'ultracemco', 
    type: 'stock', 
    symbol: 'ULTRACEMCO', 
    title: 'UltraTech Cement',
    content: "UltraTech Cement is India's largest cement producer with capacity of 130+ MTPA. The company is present across grey cement, white cement, and ready-mix concrete. Key drivers: infrastructure and housing demand, capacity utilization, fuel cost optimization, and pricing power. Sensitive to coal/pet coke prices, limestone availability, and real estate cycle. Sector: Cement. Index: NIFTY 50." 
  },
  { 
    id: 'nestleind', 
    type: 'stock', 
    symbol: 'NESTLEIND', 
    title: 'Nestle India',
    content: "Nestle India is a subsidiary of Nestlé S.A., manufacturing and selling food and beverage products including Maggi, KitKat, Nescafe, and Milkybar. Key drivers: premiumization, rural penetration, volume growth, and pricing power. Known for high ROE and consistent dividend payouts. Sensitive to raw material costs (coffee, cocoa, milk) and rural demand. Sector: FMCG. Index: NIFTY 50, NIFTY FMCG." 
  },
  { 
    id: 'bajfinance', 
    type: 'stock', 
    symbol: 'BAJFINANCE', 
    title: 'Bajaj Finance',
    content: "Bajaj Finance is India's largest consumer durables lender and NBFC, offering personal loans, business loans, and consumer finance. AUM exceeds ₹300,000 crore. Key drivers: customer acquisition, digital lending, cross-sell, and cost of funds. Sensitive to credit cycle, unsecured lending regulations, and consumer demand. Known for high ROA/ROE and premium valuations. Sector: NBFC. Index: NIFTY 50." 
  },
  { 
    id: 'powergrid', 
    type: 'stock', 
    symbol: 'POWERGRID', 
    title: 'Power Grid Corporation',
    content: "Power Grid Corporation is India's largest electric power transmission company, owning ~85% of inter-regional transmission capacity. The company operates on a regulated return-on-equity model (15.5% RoE). Key drivers: capital expenditure plan, transmission tariff, and renewable energy evacuation. Sensitive to regulatory RoE changes and government capex. Known for stable cash flows and high dividend yield. Sector: Power. Index: NIFTY 50." 
  },
  { 
    id: 'ntpc', 
    type: 'stock', 
    symbol: 'NTPC', 
    title: 'NTPC Limited',
    content: "NTPC is India's largest power generation company with ~70GW capacity, primarily coal-based but rapidly adding renewable capacity. Key drivers: capacity addition, PLF improvement, coal availability, and green energy transition. Sensitive to coal prices, environmental regulations, and power demand. Known for stable earnings and high dividend yield. Sector: Power. Index: NIFTY 50, NIFTY Energy." 
  },
  { 
    id: 'hcltech', 
    type: 'stock', 
    symbol: 'HCLTECH', 
    title: 'HCL Technologies',
    content: "HCL Technologies is a leading global IT services company, specializing in engineering and R&D services, cloud, and digital transformation. Revenue ~$13B. Key drivers: telecom and manufacturing verticals, engineering services, and deal wins. Sensitive to discretionary spending and client budget cuts. Known for higher exposure to infrastructure services. Sector: IT. Index: NIFTY 50, NIFTY IT." 
  },
  { 
    id: 'ongc', 
    type: 'stock', 
    symbol: 'ONGC', 
    title: 'Oil & Natural Gas Corporation',
    content: "ONGC is India's largest oil and gas exploration and production company, producing ~70% of India's domestic crude oil and gas. Key drivers: global crude prices, domestic production growth, and subsidy burden reduction. Sensitive to global oil prices, government subsidy policies, and exploration costs. Known for high dividend yield. Sector: Energy/Oil & Gas. Index: NIFTY 50, NIFTY Energy." 
  },
  { 
    id: 'coalindia', 
    type: 'stock', 
    symbol: 'COALINDIA', 
    title: 'Coal India',
    content: "Coal India is the world's largest coal producer, contributing ~80% of India's coal production. Key drivers: production volume growth, e-auction premium, and fuel supply agreements. Sensitive to power demand, environmental regulations, and wage revisions. Known for high dividend yield and cash-rich balance sheet. Sector: Energy/Mining. Index: NIFTY 50, NIFTY Energy." 
  },
  { 
    id: 'adani', 
    type: 'stock', 
    symbol: 'ADANIENT', 
    title: 'Adani Enterprises',
    content: "Adani Enterprises is the flagship company of the Adani Group, operating across trading, solar manufacturing, airports, roads, and data centers. Key incubating businesses: Adani Green, Adani Total Gas, Adani Wilmar. Key drivers: infrastructure capex, solar module manufacturing, airport monetization, and new business incubation. Sensitive to government policy, commodity prices, and group leverage. Sector: Infrastructure/Diversified. Index: NIFTY 50." 
  },
  { 
    id: 'jswsteel', 
    type: 'stock', 
    symbol: 'JSWSTEEL', 
    title: 'JSW Steel',
    content: "JSW Steel is India's largest steel producer by capacity (~28 MTPA). The company produces flat and long steel products for automotive, infrastructure, and construction. Key drivers: steel demand, capacity expansion, iron ore costs, and export parity. Sensitive to global steel prices, China's steel exports, and coking coal costs. Sector: Metals/Steel. Index: NIFTY 50, NIFTY Metal." 
  },
  { 
    id: 'techm', 
    type: 'stock', 
    symbol: 'TECHM', 
    title: 'Tech Mahindra',
    content: "Tech Mahindra is an IT services company specializing in telecom, networking, and enterprise solutions. Revenue ~$6B. Key drivers: 5G rollout deals, communications vertical recovery, and digital transformation services. Sensitive to telecom client capex, BFSI diversification progress, and margin improvement. Sector: IT. Index: NIFTY 50, NIFTY IT." 
  },
  {
    id: 'heromotoco', 
    type: 'stock', 
    symbol: 'HEROMOTOCO', 
    title: 'Hero MotoCorp',
    content: "Hero MotoCorp is the world's largest manufacturer of two-wheelers, leading in entry and executive segment motorcycles. Key drivers: rural demand, premiumization strategy (Harley-Davidson partnership, Mavrick), and EV transition (VIDA brand). Sensitive to rural sentiment, monsoon health, and raw material costs. Sector: Automobile. Index: NIFTY 50, NIFTY Auto." 
},
  { 
    id: 'sector-it', 
    type: 'sector', 
    symbol: 'IT', 
    title: 'IT Sector Overview',
    content: "The Indian IT sector includes TCS, Infosys, HCL Tech, Wipro, and Tech Mahindra. The sector generates $250+ billion in revenue annually, with $190+ billion from exports. Key trends: AI/automation adoption, cloud migration, digital transformation deals, and margin pressure from wage inflation. The sector is a major contributor to India's forex reserves and employment. Sensitive to US discretionary spending, H1B visa policies, and global economic growth. NIFTY IT index tracks the top 10 IT companies." 
  },
  { 
    id: 'sector-banking', 
    type: 'sector', 
    symbol: 'Banking', 
    title: 'Banking Sector Overview',
    content: "The Indian banking sector includes public-sector banks (SBI, PNB, Bank of Baroda) and private-sector banks (HDFC, ICICI, Axis, Kotak). Total banking assets exceed ₹200 lakh crore. Key trends: credit growth (~15%), improving asset quality (GNPA ~3%), digital banking adoption, and deposit mobilization. Sensitive to RBI repo rate decisions, credit-deposit ratio, and unsecured lending regulations. NIFTY Bank and NIFTY PSU Bank indices track the sector." 
  },
  { 
    id: 'sector-energy', 
    type: 'sector', 
    symbol: 'Energy', 
    title: 'Energy Sector Overview',
    content: "The Indian energy sector includes oil & gas (Reliance, ONGC, Oil India), power generation (NTPC, Power Grid), and coal mining (Coal India). Key trends: energy transition to renewables, solar capacity addition, green hydrogen push, and reducing crude import dependence. Sensitive to global crude prices, government energy policies, and monsoon impact on hydro power. India aims for 500GW renewable capacity by 2030." 
  },
  { 
    id: 'sector-fmcg', 
    type: 'sector', 
    symbol: 'FMCG', 
    title: 'FMCG Sector Overview',
    content: "The Indian FMCG sector includes HUL, ITC, Nestle, Britannia, Dabur, and Marico. The sector is characterized by stable cash flows, high ROE, and defensive characteristics. Key trends: rural demand recovery, premiumization, direct-to-consumer channels, and raw material cost management. Sensitive to rural consumption, agricultural output, and commodity prices (palm oil, crude, wheat). NIFTY FMCG index tracks the sector." 
  },
  { 
    id: 'sector-pharma', 
    type: 'sector', 
    symbol: 'Pharma', 
    title: 'Pharmaceutical Sector Overview',
    content: "The Indian pharma sector is the world's largest provider of generic drugs, supplying 20% of global generics by volume. Key companies: Sun Pharma, Cipla, Dr Reddy's, Lupin, and Aurobindo. Key trends: US generics pricing pressure, specialty pipeline development, API self-sufficiency, and India domestic formulation growth. Sensitive to US FDA inspections, drug pricing regulations, and R&D outcomes. NIFTY Pharma index tracks the sector." 
  },
  { 
    id: 'sector-auto', 
    type: 'sector', 
    symbol: 'Automobile', 
    title: 'Automobile Sector Overview',
    content: "The Indian automobile sector includes passenger vehicles (Maruti, Tata Motors, M&M), commercial vehicles (Tata, Ashok Leyland), and two-wheelers (Hero, Bajaj Auto). Key trends: EV transition, SUV mix improvement, export growth, and rural demand. Sensitive to semiconductor availability, commodity prices, interest rates (auto loans), and government EV policies. NIFTY Auto index tracks the sector." 
  },
  { 
    id: 'sector-telecom', 
    type: 'sector', 
    symbol: 'Telecom', 
    title: 'Telecom Sector Overview',
    content: "The Indian telecom sector is dominated by Bharti Airtel, Reliance Jio, and Vodafone Idea (VIL). Key trends: 5G rollout, ARPU growth, tariff hikes, and fiber-to-home expansion. The sector has high capex requirements and is sensitive to regulatory decisions (TRAI), competitive intensity, and AGR dues. Jio and Airtel are gaining market share while VIL struggles with debt." 
  },
  { 
    id: 'sector-power', 
    type: 'sector', 
    symbol: 'Power', 
    title: 'Power Sector Overview',
    content: "The Indian power sector includes generation (NTPC, Tata Power, Adani Power), transmission (Power Grid), and distribution. Key trends: renewable energy transition, solar/wind capacity addition, grid modernization, and UDAY scheme impact. Sensitive to coal availability, power demand (linked to GDP growth), and environmental regulations. India is the world's third-largest electricity producer." 
  },
  { 
    id: 'sector-metals', 
    type: 'sector', 
    symbol: 'Metals', 
    title: 'Metals Sector Overview',
    content: "The Indian metals sector includes steel (JSW Steel, Tata Steel, SAIL), aluminum (Hindalco, NALCO), and copper (Hindustan Copper). Key trends: infrastructure capex driving demand, capacity expansion, and China's export impact. Sensitive to global commodity prices, coking coal costs, and anti-dumping duties. NIFTY Metal index tracks the sector." 
  },
  { 
    id: 'sector-cement', 
    type: 'sector', 
    symbol: 'Cement', 
    title: 'Cement Sector Overview',
    content: "The Indian cement sector is the world's second-largest after China, with capacity of 600+ MTPA. Key players: UltraTech, Shree Cement, Ambuja, ACC, Dalmia. Key trends: infrastructure and housing demand, capacity utilization, fuel cost optimization, and consolidation. Sensitive to coal/pet coke prices, limestone availability, and real estate cycle." 
  },

  { 
    id: 'concept-vwap', 
    type: 'concept', 
    title: 'VWAP (Volume Weighted Average Price)',
    content: "VWAP is the ratio of the value traded to total volume traded over a particular time horizon. It is a trading benchmark used by institutional traders to gauge execution quality. If your buy price is below VWAP, you're getting a better-than-average price. If above, you're paying more than the average. VWAP is calculated as: sum(price × volume) / sum(volume). Many traders use VWAP as a dynamic support/resistance level. Price above VWAP suggests bullish sentiment; below VWAP suggests bearish sentiment." 
  },
  { 
    id: 'concept-circuit', 
    type: 'concept', 
    title: 'Circuit Limits & Price Bands',
    content: "Circuit limits are price bands set by exchanges to prevent excessive volatility. For most NSE stocks, the daily circuit limit is ±20% of the previous closing price. When a stock hits the upper circuit, only buyers are present (no sellers), and trading halts. When it hits the lower circuit, only sellers are present. Some stocks have tighter bands (2%, 5%, 10%) based on volatility and market cap. Circuit filters protect retail investors from manipulation but can also trap positions when liquidity dries up." 
  },
  { 
    id: 'concept-52w', 
    type: 'concept', 
    title: '52-Week High/Low',
    content: "The 52-week high and low represent the highest and lowest prices a stock has traded at over the past year. These are psychological levels: breaking above the 52-week high often signals bullish momentum and can attract momentum buyers. Conversely, breaking below the 52-week low may signal fundamental deterioration. However, 52-week highs/lows alone are not buy/sell signals — they should be combined with volume, fundamentals, and market context. Many traders use the 52-week range position (where current price sits between high and low) as a valuation gauge." 
  },
  { 
    id: 'concept-pnl', 
    type: 'concept', 
    title: 'P&L (Profit and Loss)',
    content: "P&L or Profit and Loss is the difference between the current market value of a position and its cost basis. Realized P&L occurs when you close a position; unrealized P&L (also called MTM or mark-to-market) reflects open positions. P&L = (Current Price - Average Buy Price) × Quantity. P&L percentage = (P&L / Cost) × 100. In trading, tracking P&L helps assess strategy effectiveness and manage risk. Daily MTM is important for futures and options positions as they are settled daily." 
  },
  { 
    id: 'concept-orderbook', 
    type: 'concept', 
    title: 'Market Depth & Order Book',
    content: "Market depth (or order book) shows the top 5 buy and sell orders for a stock at different price levels. The bid side shows buyers with their price and quantity; the ask side shows sellers. The difference between the best bid and best ask is called the spread. A narrow spread indicates high liquidity; a wide spread indicates low liquidity. Order book imbalance (more bids than asks or vice versa) can signal short-term price direction. Large orders at specific price levels can act as support/resistance." 
  },
  { 
    id: 'concept-candlestick', 
    type: 'concept', 
    title: 'Candlestick Charts',
    content: "Candlestick charts display price action using four data points: open, high, low, and close (OHLC). A green (or white) candle means close > open (bullish). A red (or black) candle means close < open (bearish). The body shows the open-to-close range; the wicks (shadows) show the high-low range. Common patterns: Doji (indecision), Hammer (reversal), Engulfing (trend change), Morning/Evening Star. Candlestick patterns are most reliable when combined with volume confirmation and support/resistance levels." 
  },
  { 
    id: 'concept-portfolio', 
    type: 'concept', 
    title: 'Portfolio Management',
    content: "Portfolio management involves selecting, monitoring, and rebalancing investments to achieve financial goals. Key principles: diversification across sectors and asset classes, risk management via position sizing, regular rebalancing, and tracking performance against benchmarks. A well-balanced portfolio might include growth stocks (IT, auto), defensive stocks (FMCG, pharma), and high-dividend stocks (power, energy). Position sizing: never put more than 5-10% of capital in a single stock. Rebalance quarterly or when allocations drift by more than 5%." 
  },
  { 
    id: 'concept-risk', 
    type: 'concept', 
    title: 'Risk Management in Trading',
    content: "Risk management is the process of identifying, assessing, and controlling threats to your capital. Key rules: 1) Never risk more than 1-2% of total capital on a single trade. 2) Use stop-loss orders to limit downside. 3) Maintain a risk-reward ratio of at least 1:2. 4) Diversify across sectors and market caps. 5) Avoid averaging down on losing positions without a thesis. 6) Keep a trading journal. 7) Don't trade with borrowed money. The goal is not to avoid losses but to ensure no single loss can end your trading career." 
  },
  { 
    id: 'concept-stoploss', 
    type: 'concept', 
    title: 'Stop Loss Orders',
    content: "A stop-loss order automatically sells a stock when it reaches a predetermined price, limiting potential losses. Types: 1) Fixed stop loss (e.g., 5% below buy price). 2) Trailing stop loss (moves up as price rises, locks in profits). 3) Volatility-based stop loss (ATR-based). Placement: below support levels for longs, above resistance for shorts. Stop losses should be based on technical levels, not arbitrary percentages. Avoid placing stops at obvious round numbers (e.g., ₹100, ₹500) as they tend to get hunted." 
  },
  { 
    id: 'concept-diversification', 
    type: 'concept', 
    title: 'Diversification Strategy',
    content: "Diversification reduces risk by spreading investments across uncorrelated assets. In stock trading: diversify across sectors (IT, banking, FMCG, energy), market caps (large, mid, small), and styles (growth, value, dividend). Over-diversification (more than 15-20 stocks) dilutes returns without significantly reducing risk. Correlation matters: holding 5 IT stocks is not diversification. Aim for low correlation between holdings. Rebalance when any sector exceeds 30% of portfolio value." 
  },
  { 
    id: 'concept-margin', 
    type: 'concept', 
    title: 'Margin Trading & Leverage',
    content: "Margin trading allows you to buy more shares than your capital would normally permit by borrowing from the broker. SEBI regulations allow up to 4x leverage for intraday (MIS) and 1x for delivery. Leverage amplifies both gains and losses: a 10% move with 4x leverage equals 40% gain or loss on capital. Margin calls occur when losses exceed the maintenance margin, forcing liquidation. Use leverage cautiously — it is the #1 reason traders blow up their accounts. Never use leverage without a stop loss." 
  },
  { 
    id: 'concept-hedging', 
    type: 'concept', 
    title: 'Hedging Strategies',
    content: "Hedging reduces risk by taking offsetting positions. Common strategies: 1) Buy a stock, buy a put option to cap downside. 2) Hold a portfolio, sell NIFTY futures to hedge market risk (beta hedging). 3) Pairs trading: long one stock, short a correlated competitor. 4) Gold as a hedge against equity volatility. Hedging costs money (option premium, margin) but provides insurance. Perfect hedging eliminates both upside and downside — partial hedging (50-70%) is more practical." 
  },
  { 
    id: 'concept-futures', 
    type: 'concept', 
    title: 'Futures Contracts',
    content: "A futures contract is an agreement to buy or sell an asset at a predetermined price on a future date. In India, NSE offers futures on NIFTY, Bank NIFTY, and individual stocks. Key features: standardized lot sizes, daily MTM settlement, expiry on last Thursday of month. Futures allow leverage (margin is 15-30% of contract value). Pricing: Futures price = Spot + Cost of Carry. Contango (futures > spot) is normal; backwardation (futures < spot) signals expected price decline." 
  },
  { 
    id: 'concept-options', 
    type: 'concept', 
    title: 'Options Trading',
    content: "Options give the right (not obligation) to buy (call) or sell (put) at a strike price. Call options profit when price rises; put options profit when price falls. Option pricing depends on: underlying price, strike price, time to expiry, volatility, and interest rates (Black-Scholes model). Key Greeks: Delta (price sensitivity), Theta (time decay), Vega (volatility sensitivity), Gamma (delta change). Option sellers have higher win rate but unlimited risk; option buyers have limited risk but lower win rate. Start with simple strategies: covered calls, protective puts." 
  },
  { 
    id: 'concept-technical', 
    type: 'concept', 
    title: 'Technical Analysis Basics',
    content: "Technical analysis studies price and volume patterns to predict future movements. Key tools: 1) Trend lines and channels. 2) Moving averages (50-day, 200-day for trend; EMA for faster signals). 3) RSI (overbought >70, oversold <30). 4) MACD (moving average convergence/divergence). 5) Bollinger Bands (volatility). 6) Support and resistance levels. 7) Volume analysis (volume confirms price moves). Technical analysis works because markets exhibit trends and patterns driven by human psychology. Always combine multiple indicators for confirmation." 
  },
  { 
    id: 'concept-fundamental', 
    type: 'concept', 
    title: 'Fundamental Analysis',
    content: "Fundamental analysis evaluates a stock's intrinsic value by examining financials, management, industry position, and macroeconomic factors. Key metrics: P/E ratio (price/earnings), P/B ratio (price/book), ROE (return on equity), ROCE (return on capital employed), debt-to-equity ratio, free cash flow, and dividend yield. Compare metrics with peers and historical averages. A stock is undervalued if market price < intrinsic value. Combine fundamental analysis (what to buy) with technical analysis (when to buy) for best results." 
  },
  { 
    id: 'concept-nifty', 
    type: 'concept', 
    title: 'NIFTY 50 Index',
    content: "NIFTY 50 is the NSE's benchmark index, representing 50 large-cap stocks across 22 sectors. It is market-cap weighted and represents ~65% of the NSE's total market cap. Base value was 1000 on November 3, 1995. The index is reviewed semi-annually. Related indices: NIFTY Bank, NIFTY IT, NIFTY Midcap, NIFTY Smallcap. NIFTY futures and options are among the most traded derivatives globally. The index is a barometer of Indian equity markets and economic sentiment." 
  },
  { 
    id: 'concept-sensex', 
    type: 'concept', 
    title: 'SENSEX (BSE Sensex)',
    content: "SENSEX is the BSE's benchmark index, comprising 30 large-cap stocks. It is market-cap weighted and represents ~45% of BSE's total market cap. Base value was 100 on April 1, 1979. SENSEX is the oldest index in India and is widely tracked globally. Together with NIFTY 50, it is the primary gauge of Indian stock market performance. Both indices are highly correlated (>0.95) and move together in most market conditions." 
  },
  { 
    id: 'concept-vix', 
    type: 'concept', 
    title: 'INDIA VIX (Volatility Index)',
    content: "INDIA VIX is NSE's volatility index, measuring market's expectation of near-term volatility based on NIFTY option prices. It is also called the \"fear index.\" VIX > 20 indicates high fear and expected volatility; VIX < 15 indicates complacency and low expected volatility. VIX is inversely correlated with market returns: when VIX spikes, markets usually fall. Traders use VIX for: timing entries (buy when VIX peaks), position sizing (reduce size when VIX is high), and hedging (buy VIX calls as portfolio insurance)." 
  },
  { 
    id: 'concept-liquidity', 
    type: 'concept', 
    title: 'Liquidity in Stock Markets',
    content: "Liquidity refers to how easily a stock can be bought or sold without significantly impacting its price. High liquidity: narrow bid-ask spread, high volume, large number of buyers/sellers. Low liquidity: wide spread, low volume, slippage. Large-cap stocks (NIFTY 50) are highly liquid; small-cap stocks may have low liquidity. Liquidity matters because: 1) It determines transaction costs (slippage). 2) It affects stop-loss execution. 3) It impacts large order fills. Always check average daily volume before trading." 
  },
  { 
    id: 'concept-brokerage', 
    type: 'concept', 
    title: 'Brokerage & Transaction Costs',
    content: "Transaction costs in Indian stock trading include: 1) Brokerage (0.01-0.5% depending on broker and segment). 2) STT (Securities Transaction Tax): 0.1% on delivery buys/sells, 0.025% on intraday sells. 3) Exchange charges (~0.003%). 4) SEBI turnover fee (~0.0001%). 5) Stamp duty (0.003-0.015%, varies by state). 6) GST (18% on brokerage). Total costs range from 0.05% to 0.5% per trade. Discount brokers (Zerodha, Upstox) charge ₹20 per order for intraday/F&O. These costs matter for high-frequency trading." 
  },
  { 
    id: 'concept-rbi', 
    type: 'concept', 
    title: 'RBI Monetary Policy Impact',
    content: "RBI monetary policy directly impacts stock markets. Repo rate hikes increase borrowing costs, reduce corporate profitability, and typically lead to market corrections — especially in rate-sensitive sectors (banking, real estate, auto). Repo rate cuts stimulate growth and are positive for equities. Key rates: Repo (current 6.5%), Reverse Repo, CRR, SLR. RBI meets 6 times a year. Market reactions depend on whether the action was expected. Rate-sensitive sectors: Banks (NIM impact), NBFCs (borrowing costs), Real Estate (EMI burden), Auto (loan demand)." 
  },
  { 
    id: 'concept-momentum', 
    type: 'concept', 
    title: 'Momentum Trading Strategy',
    content: "Momentum trading buys stocks that are rising and sells those that are falling, based on the principle that trends persist. Key indicators: 1) Rate of Change (ROC). 2) Relative Strength Index (RSI). 3) Price vs moving averages. 4) 52-week high breakout. Entry: buy when stock breaks above resistance with high volume. Exit: sell when momentum wanes (RSI divergence, moving average crossover). Risk: momentum can reverse suddenly. Always use trailing stop losses. Best in trending markets; avoid in choppy/sideways markets." 
  },
  { 
    id: 'concept-dca', 
    type: 'concept', 
    title: 'Dollar-Cost Averaging (DCA)',
    content: "DCA is an investment strategy where you invest a fixed amount at regular intervals, regardless of market conditions. Benefits: 1) Reduces timing risk (no need to time the market). 2) Buys more shares when prices are low, fewer when high. 3) Smooths out volatility over time. 4) Disciplined approach. Best for long-term investors in index funds or quality stocks. In India, SIP (Systematic Investment Plan) in mutual funds is the most popular DCA method. For stocks, DCA works best with fundamentally strong large-cap stocks." 
  },
  { 
    id: 'concept-swing', 
    type: 'concept', 
    title: 'Swing Trading',
    content: "Swing trading holds positions for days to weeks, capturing medium-term price movements. Key principles: 1) Identify stocks with clear trends. 2) Enter on pullbacks to support or moving averages. 3) Target the next resistance level. 4) Use trailing stop losses. 5) Risk-reward ratio of 1:2 or better. Best indicators: EMA (9, 21), RSI, MACD, volume. Swing trading requires less screen time than intraday and is suitable for working professionals. Key risk: overnight gap risk (market opens significantly different from previous close)." 
  },
  { 
    id: 'concept-intraday', 
    type: 'concept', 
    title: 'Intraday Trading',
    content: "Intraday trading involves buying and selling within the same trading session, with no overnight positions. Key principles: 1) Trade only liquid, high-volume stocks. 2) Follow the trend (buy strong, sell weak). 3) Use technical levels (support/resistance, VWAP). 4) Strict stop loss (1-2% of capital). 5) Exit before 3:15 PM if using MIS. 6) Maximum 2-3 trades per day. Common mistakes: overtrading, not using stop losses, averaging losses, and revenge trading. Intraday requires discipline, fast execution, and emotional control. Not suitable for beginners." 
  },
  { 
    id: 'concept-penny', 
    type: 'concept', 
    title: 'Penny Stocks & Risks',
    content: "Penny stocks are low-priced stocks (typically below ₹50) with small market caps. Risks: 1) Low liquidity (wide spreads, slippage). 2) Manipulation (pump and dump schemes). 3) Poor fundamentals (many are loss-making). 4) Limited public information. 5) High volatility. 6) Delisting risk. SEBI has tightened regulations, but penny stock scams persist. If you must trade them: 1) Do thorough research. 2) Use small capital. 3) Set strict stop losses. 4) Avoid tips from Telegram/WhatsApp groups. 5) Check promoter holding and pledged shares." 
  },
  { 
    id: 'concept-ipo', 
    type: 'concept', 
    title: 'IPO Investing',
    content: "An IPO (Initial Public Offering) is when a private company offers shares to the public for the first time. Key factors: 1) Issue price vs fair value (check DRHP for financials). 2) GMP (Grey Market Premium) as sentiment indicator. 3) Subscription rates (QIB, HNI, retail). 4) Promoter selling (exit vs partial dilution). 5) Use of proceeds (growth vs debt repayment). 6) Peer valuation comparison. Post-listing: 3) Listing gains are not guaranteed. 4) Long-term value depends on fundamentals. 5) Avoid applying with borrowed funds. SEBI has reduced IPO timelines and increased transparency." 
  },
  { 
    id: 'concept-sector-rotation', 
    type: 'concept', 
    title: 'Sector Rotation Strategy',
    content: "Sector rotation is a strategy that shifts investments between sectors based on the economic cycle. Early cycle: autos, housing, capital goods (rate cuts, demand recovery). Mid cycle: IT, banking, FMCG (earnings growth, stable rates). Late cycle: energy, metals, commodities (inflation, commodity price spikes). Recession: pharma, FMCG, utilities (defensive). The strategy works because different sectors outperform at different stages of the economic cycle. Track leading indicators: PMI, IIP, CPI, repo rate, and credit growth to identify the current cycle phase." 
  },
  { 
    id: 'concept-marketcap', 
    type: 'concept', 
    title: 'Market Capitalization',
    content: "Market capitalization = share price × total shares outstanding. Categories: Large-cap (>₹20,000 crore, NIFTY 50 stocks), Mid-cap (₹5,000-20,000 crore), Small-cap (<₹5,000 crore). Large-cap: stable, liquid, lower returns, lower risk. Mid-cap: growth potential, moderate risk, moderate liquidity. Small-cap: high growth potential, high risk, low liquidity. Diversify across market caps: 60-70% large-cap, 20-30% mid-cap, 5-10% small-cap. Small-caps can outperform in bull markets but suffer more in corrections. Always check market cap before investing — it affects risk, liquidity, and volatility." 
  },
  { 
    id: 'concept-rsi', 
    type: 'concept', 
    title: 'RSI (Relative Strength Index)',
    content: "RSI is a momentum oscillator that measures the speed and change of price movements, ranging from 0 to 100. Overbought: RSI > 70 (potential sell signal). Oversold: RSI < 30 (potential buy signal). Divergence: price makes higher high but RSI makes lower high (bearish divergence) — signals trend reversal. RSI is best used in ranging markets; in strong trends, RSI can stay overbought/oversold for extended periods. Common settings: 14-period. For Indian markets, RSI works well on daily and hourly charts. Combine with volume and support/resistance for higher accuracy." 
  },
  { 
    id: 'concept-pe', 
    type: 'concept', 
    title: 'P/E Ratio (Price-to-Earnings)',
    content: "P/E ratio = market price / earnings per share (EPS). It indicates how much investors are willing to pay for ₹1 of earnings. Trailing P/E uses past 4 quarters' EPS; forward P/E uses projected EPS. Interpretation: Low P/E may indicate undervaluation or declining fundamentals. High P/E may indicate growth expectations or overvaluation. Always compare P/E with: 1) Sector average. 2) Historical range (5-year average). 3) Peer companies. 4) Earnings growth rate (PEG ratio = P/E / growth). NIFTY 50 P/E historically averages 20-22; above 25 is considered expensive." 
  },
  { 
    id: 'concept-dividend', 
    type: 'concept', 
    title: 'Dividend Investing',
    content: "Dividend investing focuses on stocks that pay regular dividends, providing income along with capital appreciation. Key metrics: dividend yield (annual dividend / price), payout ratio (dividend / EPS), and dividend growth rate. High-yield stocks in India: ITC (~3%), Coal India (~6%), ONGC (~5%), Power Grid (~4%), NTPC (~3%). Benefits: 1) Passive income. 2) Downside protection (yield support). 3) Compounding via reinvestment. Risks: 1) Dividend cuts. 2) Value traps. 3) Tax on dividends. Best for conservative investors and retirees. Look for consistent dividend history, not just high yield." 
  },
  { 
    id: 'concept-systematic', 
    type: 'concept', 
    title: 'Systematic Trading',
    content: "Systematic (algo) trading uses predefined rules for entries, exits, and risk management, removing emotional bias. Components: 1) Strategy (trend-following, mean reversion, momentum). 2) Backtesting on historical data. 3) Position sizing (Kelly criterion, fixed fractional). 4) Risk management (max drawdown, Sharpe ratio). 5) Execution (API-based). In India, SEBI requires algo orders to be tagged with a unique ID. Retail traders can use platforms like Zerodha Streak, Tradetron, or custom Python APIs. Key: start simple, validate robustly, and account for transaction costs and slippage in backtesting." 
  }
]);