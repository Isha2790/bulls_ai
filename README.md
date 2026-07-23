<h1 align="center">📈 Bull's AI</h1>

<p align="center">
  <strong>A high-frequency equities analytics platform and full-stack financial trading dashboard.</strong>
</p>

The goal was to design a high-throughput, low-latency financial dashboard capable of visualizing high-density data matrices in real-time, structurally decoupled from a serverless backend orchestration layer running context-aware RAG vector pipelines. 

👉 **You can check this out** [bulls-ai.vercel.app](https://bulls-ai.vercel.app/)

---

## ✨ Core Features & Functionality

* **Interactive Market Analytics:** A high-performance trading layout built to track custom equities baskets and render real-time pricing trends seamlessly.
* **Intelligent Financial Assistant:** Integrated a LIVE **RAG (Retrieval-Augmented Generation)** AI engine powered by Groq LLM. The assistant actively queries an embedded knowledge base using custom document vector ingestion to deliver context-aware financial research about the stock market and macroeconomics.
* **Production-Ready Data Architecture:** Built with structural scaling in mind, the architecture transitions smoothly from browser memory storage (`LocalStorage`) to a structured, live production database backend.
* **Premium Dashboard UX:** A clean, space-optimized dark theme crafted to present dense financial data beautifully without cluttering the interface.

---

## ⚡ The Tech Stack

I selected this modern stack to ensure fast compilation, modular components, and scalable database performance:

* **Frontend Framework:** `React` (Functional components, custom state management hooks)
* **Build Tooling:** `Vite` (Optimized for lightning-fast Hot Module Replacement)
* **Styling & Layout:** `Tailwind CSS` (Custom utility configurations for structural dark-mode grids)
* **Database & Cloud Backend:** `Supabase` (Configured with a structured relational `PostgreSQL` schema)
* **Serverless Compute:** `TypeScript Edge Functions` (Handling seamless backend cloud integrations)
* **Hosting & CI/CD:** `Vercel` (Configured with production and preview environment pipelines)

## Project Architecture
```
├── src/
│   ├── components/            
│   │   ├── AIAssistant.jsx    # Real-time AI assistant chat
│   │   ├── AddFunds.jsx       # Paper trading wallet funding modal
│   │   ├── AuthPage.jsx       # Authentication page
│   │   ├── BrokerConnect.jsx  # Upstox API key connection UI
│   │   ├── CandlestickChart.jsx # Interactive intraday chart renderer
│   │   ├── GlobalSearch.jsx   # Equity search & quick navigation
│   │   ├── IndexBar.jsx       # Benchmark indices ticker tape (NIFTY/SENSEX)
│   │   ├── MarketDashboard.jsx # Core market table & telemetry cards
│   │   ├── MarketDepth.jsx    # 5-level order book bid/ask visualization
│   │   ├── MarketHeatmap.jsx  # NIFTY 50 capital heatmap matrix
│   │   ├── MiniSparkline.jsx  # SVG sparkline chart component
│   │   ├── PortfolioView.jsx  # Paper portfolio holdings & P&L tracker
│   │   ├── SEBIDisclaimer.jsx # Regulatory disclaimer component
│   │   ├── SplashScreen.jsx  # App initial bootloader UI
│   │   ├── StockDetail.jsx    # Individual stock detail modal view
│   │   ├── TickerTape.jsx     # Live streaming tick marquee bar
│   │   ├── TopMovers.jsx      # Top session gainers & decliners widget
│   │   └── TradeHistory.jsx   # Executed order log & ledger history
│   ├── context/               
│   │   ├── ThemeContext.jsx          # Dark/light UI mode state manager
│   │   └── TradingModeContext.jsx    # Paper trading vs. live mode toggle
│   ├── hooks/                 
│   │   ├── useISTClock.js            # Live Indian Standard Time sync hook
│   │   └── useLiveQuotes.js          # Live price tick subscription hook
│   ├── lib/                   
│   │   ├── database.js        # Supabase client & persistence utilities
│   │   ├── knowledgeBase.js   # Embedded market concepts & knowledge embeddings
│   │   ├── marketEngine.js    # Custom event-driven high-frequency state engine
│   │   ├── marketGuard.js     # NSE market hours & session status validator
│   │   ├── priceFetcher.js    # Upstox V3 WebSocket & V2 REST feed handlers
│   │   ├── ragGenerator.js    # AI response generation pipeline
│   │   ├── ragRetriever.js    # Context vector retrieval engine
│   │   └── stocks.js          # Default market instruments & token registry
│   ├── app.jsx                # Root application layout & routing view
│   ├── index.css              # Global styles & Tailwind directives
│   └── main.jsx               # React DOM entry point
├── supabase/                  
│   ├── functions/
│   │   ├── ai-chat/           # Serverless edge function for AI assistant
│   │   │   └── index.ts
│   │   └── upstox-proxy/      # Edge proxy for Upstox OAuth & API headers
│   │       └── index.ts
│   └── migrations/
│       └── stock_trading_schema.sql # Database schema & tables setup
├── .gitignore                 # Git ignored files & environments
├── index.html                 # Main HTML entry file
├── package.json               # Node dependencies & scripts
├── postcss.config.js          # PostCSS configuration for Tailwind
├── README.md                  # Project documentation & overview
├── tailwind.config.js         # Tailwind CSS styling configuration
└── vite.config.js             # Vite bundler configuration
```

## 🚀 Running the Project Locally

If you want to explore the codebase or spin up a local development server, follow these quick steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Isha2790/bulls_ai.git](https://github.com/Isha2790/bulls_ai.git)

2. **Navigate into the directory:**
   ```bash
   cd bulls_ai

3. **Install dependencies:**
   ```bash
   npm install

4. **Launch the app**
   ```bash
   npm run dev
