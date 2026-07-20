import { useEffect, useState, useCallback, useMemo } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import { TradingModeProvider, useTradingMode } from './context/TradingModeContext.jsx';
import {
  getCurrentUser, signOut, getPortfolio, getHoldings,
  getTrades, getWatchlist, saveWatchlist, addFunds
} from './lib/database.js';

// Proprietary stream analytics hooks
import { useLiveQuotes, useLiveIndices } from './hooks/useLiveQuotes.js';
import { useISTClock } from './hooks/useISTClock.js';
import { fmtINR } from './lib/marketEngine.js';

// Component layout layers
import SplashScreen from './components/SplashScreen.jsx';
import SEBIDisclaimer from './components/SEBIDisclaimer.jsx';
import AuthPage from './components/AuthPage.jsx';
import IndexBar from './components/IndexBar.jsx';
import TickerTape from './components/TickerTape.jsx';
import MarketDashboard from './components/MarketDashboard.jsx';
import StockDetail from './components/StockDetail.jsx';
import PortfolioView from './components/PortfolioView.jsx';
import TradeHistory from './components/TradeHistory.jsx';
import MarketHeatmap from './components/MarketHeatmap.jsx';
import TopMovers from './components/TopMovers.jsx';

// Modal and system utility panels
import AIAssistant from './components/AIAssistant.jsx';
import GlobalSearch from './components/GlobalSearch.jsx';
import BrokerConnect from './components/BrokerConnect.jsx';
import AddFunds from './components/AddFunds.jsx';
import {
  TrendingUp, LayoutDashboard, Briefcase, History, LogOut, Zap,
  Sun, Moon, Sparkles, Search, Link2, Flame
} from 'lucide-react';

// Thread tracking guard preventing layout splash regression on hot-reloads
let isInitialSplashRendered = false;

/**
 * Root Application Bootstrapper
 * Establishes foundational provider architectures and mounts global modal banners.
 */
export default function App() {
  const [showSplash, setShowSplash] = useState(() => !isInitialSplashRendered);
  const handleSplashComplete = useCallback(() => {
    isInitialSplashRendered = true;
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onDone={handleSplashComplete} />;
  }
  return (
    <ThemeProvider>
      <TradingModeProvider>
        <SEBIDisclaimer />
        <AppInner />
      </TradingModeProvider>
    </ThemeProvider>
  );
}
/**
 * Main Interface Application Frame Coordinator
 */
function AppInner() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isReal, isPaper, toggleMode, brokerConnected } = useTradingMode();
  
  // High-frequency active streaming data nodes
  const quotes = useLiveQuotes();
  const indices = useLiveIndices();
  const { time: istTime, date: istDate } = useISTClock();

  // Primary Authentication & Routing States
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('market'); // 'market' | 'portfolio' | 'history'
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'stock'
  const [selectedStock, setSelectedStock] = useState(null);

  // Relational Local Data Stores
  const [portfolio, setPortfolio] = useState({ cashBalance: 100000 });
  const [holdings, setHoldings] = useState([]);
  const [trades, setTrades] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  // Modal Panel Interaction States
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [brokerOpen, setBrokerOpen] = useState(false);
  const [fundsOpen, setFundsOpen] = useState(false);
  const [modeWarning, setModeWarning] = useState(false);

  /**
   * Refreshes user database records and updates local state buffers.
   */
  const refreshUserData = useCallback(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    setUser(currentUser);
    setPortfolio(getPortfolio(currentUser.id));
    setHoldings(getHoldings(currentUser.id));
    setTrades(getTrades(currentUser.id));
    setWatchlist(getWatchlist(currentUser.id));
  }, []);

  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setAuthed(true);
      refreshUserData();
    }
  }, [refreshUserData]);

  // Lifecycle Sync: Event pipeline managing system hotkeys 
  useEffect(() => {
    const handleGlobalHotkeys = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, []);

  // Lifecycle Sync: Global event dispatch anchor hook for structural layout nodes
  useEffect(() => {
    window._sp_selectStock = (symbol) => {
      setSelectedStock(symbol);
      setCurrentPage('stock');
      setAiOpen(false);
    };
    return () => {
      delete window._sp_selectStock;
    };
  }, []);

  // Derived Computational States (Memoized to prevent thread garbage collection)
  const selectedQuote = useMemo(() => selectedStock ? quotes.get(selectedStock) : null, [selectedStock, quotes]);
  const selectedHolding = useMemo(() => selectedStock ? holdings.find((h) => h.symbol === selectedStock) : null, [selectedStock, holdings]);
  const isWatched = useMemo(() => selectedStock ? watchlist.includes(selectedStock) : false, [selectedStock, watchlist]);

  // Core Layout Navigation Operations
  const handleAuthSuccess = () => {
    setAuthed(true);
    refreshUserData();
  };

  const handleUserSignOut = () => {
    signOut();
    setAuthed(false);
    setUser(null);
    setCurrentPage('dashboard');
    setCurrentTab('market');
  };

  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
    setCurrentPage('stock');
  };

  const handleNavigationBack = () => {
    setCurrentPage('dashboard');
    setSelectedStock(null);
  };

  const handleToggleWatchlist = (symbol) => {
    const updatedWatchlist = watchlist.includes(symbol)
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];
    
    setWatchlist(updatedWatchlist);
    if (user) saveWatchlist(user.id, updatedWatchlist);
  };

  const handleTradingModeTransition = () => {
    if (isPaper && !brokerConnected) {
      setBrokerOpen(true);
      return;
    }
    if (isReal) {
      toggleMode();
    } else {
      setModeWarning(true);
      setTimeout(() => {
        toggleMode();
        setModeWarning(false);
      }, 1500);
    }
  };

  const handleAddFundsExecution = (amount) => {
    if (user) {
      addFunds(user.id, amount);
      refreshUserData();
    }
  };

  if (!authed) return <AuthPage onAuth={handleAuthSuccess} />;

  if (!user || quotes.size === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
          Streaming Live Market Nodes...
        </p>
      </div>
    );
  }
  return (
    <div className={`ease-[cubic-bezier(0.16,1,0.3,1)] ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      
      {/* Structural Master Navigation Control Header */}
      <header 
        className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-200" 
        style={{ 
          backgroundColor: isDark ? 'rgba(9,9,11,0.85)' : 'rgba(241,245,249,0.85)', 
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)' 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Brand Identity Landmark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10 overflow-hidden">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className={`text-base font-bold tracking-tight ${isDark ? 'text-zinc-50' : 'text-slate-900'}`}>
                Bull's AI
              </span>
            </div>

            {/* Core Segment View Nav Control Buttons */}
            <nav className="flex items-center gap-0.5">
              <NavButton active={currentTab === 'market'} onClick={() => { setCurrentTab('market'); setCurrentPage('dashboard'); }} icon={LayoutDashboard} label="Market" isDark={isDark} />
              <NavButton active={currentTab === 'portfolio'} onClick={() => { setCurrentTab('portfolio'); setCurrentPage('dashboard'); }} icon={Briefcase} label="Portfolio" isDark={isDark} />
              <NavButton active={currentTab === 'history'} onClick={() => { setCurrentTab('history'); setCurrentPage('dashboard'); }} icon={History} label="Orders" isDark={isDark} />
            </nav>

            {/* Action Item Controls Matrix Zone */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`} title="Search Terminal (Ctrl+K)">
                <Search className="w-4 h-4" />
              </button>
              
              <button onClick={() => setAiOpen(true)} className="relative p-2 rounded-lg border transition-all hover:brightness-110" style={{ background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.25)' }} title="AI Stream Copilot">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              
              <button onClick={toggleTheme} className={`p-2 rounded-lg border transition-all ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`} title={isDark ? 'Trigger Light Interface' : 'Trigger Dark Interface'}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div className="flex items-center gap-1.5 ml-1">
                <button onClick={handleTradingModeTransition} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all uppercase ${isReal ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/5' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isReal ? 'bg-amber-400' : 'bg-emerald-400'} ${isReal ? 'animate-pulse' : ''}`} />
                  {isReal ? 'REAL' : 'PAPER'}
                </button>
                
                <button onClick={() => setBrokerOpen(true)} className={`p-1.5 rounded-lg border transition-all ${brokerConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:text-zinc-200' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'}`} title={brokerConnected ? 'Broker execution node operational' : 'Link external broker gateway'}>
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collapsible Wallet Asset Section */}
              <div className="hidden md:block text-right ml-1">
                <div className="flex items-center gap-1.5">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider leading-none mb-0.5">Liquidity</p>
                    <p className={`text-xs font-mono font-bold leading-none ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{fmtINR(portfolio.cashBalance, 0)}</p>
                  </div>
                  {isReal && (
                    <button onClick={() => setFundsOpen(true)} className="ml-1 px-1.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                      + Add
                    </button>
                  )}
                </div>
              </div>
              
              {/* Institutional Clock Segment Landmark */}
              <div className="hidden lg:flex flex-col items-end ml-1 px-2 py-1 rounded-lg border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)', background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.5)' }}>
                <span className={`text-xs font-mono font-bold leading-none tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{istTime}</span>
                <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-wider leading-none mt-0.5">{istDate} IST</span>
              </div>
              
              <button onClick={handleUserSignOut} className={`p-1.5 rounded-lg border transition-all ml-1 ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-red-500/10 hover:border-red-500/20' : 'bg-white border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50'}`} title="Terminate Session Framework">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Synchronized Live Market Indices Tick Bars */}
      <IndexBar indices={indices} />
      <TickerTape quotes={quotes} />

      {/* Real-time Mode Change Transition Layout Banner */}
      {modeWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold backdrop-blur-xl animate-slide-in-right shadow-lg shadow-black/20">
          Switching to live broker API execution routing...
        </div>
      )}

      {/* Functional View Switch Router Landmark Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {currentPage === 'stock' && selectedStock ? (
          <StockDetail 
            quote={selectedQuote} 
            holding={selectedHolding} 
            cashBalance={portfolio.cashBalance} 
            isWatched={isWatched} 
            onToggleWatch={() => handleToggleWatchlist(selectedStock)} 
            onBack={handleNavigationBack} 
            onTrade={refreshUserData} 
            userId={user?.id} 
          />
        ) : (
          <>
            {currentTab === 'market' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <TopMovers quotes={quotes} onSelectStock={handleSelectStock} />
                  </div>
                  <div>
                    <MarketHeatmap quotes={quotes} onSelectStock={handleSelectStock} />
                  </div>
                </div>
                <MarketDashboard quotes={quotes} watchlist={watchlist} onToggleWatch={handleToggleWatchlist} onSelectStock={handleSelectStock} />
              </>
            )}
            {currentTab === 'portfolio' && (
              <PortfolioView quotes={quotes} holdings={holdings} cashBalance={portfolio.cashBalance} onSelectStock={handleSelectStock} />
            )}
            {currentTab === 'history' && (
              <TradeHistory trades={trades} onSelectStock={handleSelectStock} />
            )}
          </>
        )}
      </main>

      {/* Compliance Platform Legal Disclaimer Footer Block */}
      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 mt-4 border-t ${isDark ? 'border-zinc-900' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className={`text-xs font-medium ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            Bull's AI Platform · Real-time equity analysis streams mapped via unified broker nodes · Sandbox & Live operations · Institutional execution sandbox template.
          </p>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              <Zap className="w-3 h-3 text-emerald-400" /> 1s Resolution Stream
            </span>
            <span className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              <Sparkles className="w-3 h-3 text-emerald-400" /> Pathway RAG Engine
            </span>
            <span className={`flex items-center gap-1 text-xs font-semibold ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              <Flame className="w-3 h-3 text-orange-400" /> Top Liquid 30 Matrix
            </span>
          </div>
        </div>
      </footer>

      {/* Layer Mounted Global Event Sidebar and Modal Managers */}
      <AIAssistant 
        quotes={quotes} 
        isOpen={aiOpen} 
        onClose={() => setAiOpen(false)} 
        currentTab={currentTab}
        currentPage={currentPage}
        selectedStock={selectedStock}
        portfolio={portfolio}
        holdings={holdings}
      />
      <GlobalSearch quotes={quotes} isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSelectStock={handleSelectStock} />
      <BrokerConnect isOpen={brokerOpen} onClose={() => setBrokerOpen(false)} />
      <AddFunds isOpen={fundsOpen} onClose={() => setFundsOpen(false)} onSuccess={handleAddFundsExecution} currentBalance={portfolio.cashBalance} />
    </div>
  );
}
/**
 * Standardized Tab Sub-Navigation Action Component
 */
function NavButton({ active, onClick, icon: Icon, label, isDark }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
        active 
          ? (isDark ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'bg-slate-200/80 text-slate-900') 
          : (isDark ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}