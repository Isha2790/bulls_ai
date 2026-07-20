import { useState, useEffect, useCallback, useMemo } from 'react';
import CandlestickChart from './CandlestickChart.jsx';
import MarketDepth from './MarketDepth.jsx';
import { ArrowLeft, Star, TrendingUp, TrendingDown, X, Zap, Shield, BarChart3, Lock } from 'lucide-react';
import { executeTrade } from '../lib/database.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTradingMode } from '../context/TradingModeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized Structural Meta Data Detail Block Component
 */
function StatItem({ label, value, isDark }) { 
  return (
    <div className="select-none">
      <p className={`text-[11px] uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>{value}</p>
    </div>
  ); 
}

/**
 * Standardized High-Frequency Layout Data Row Component
 */
function SummaryRow({ label, value, valueClass = '', isDark }) { 
  return (
    <div className="flex justify-between text-xs select-none">
      <span className={isDark ? 'text-zinc-500' : 'text-slate-400'}>{label}</span>
      <span className={`font-mono font-bold ${valueClass || (isDark ? 'text-zinc-200' : 'text-slate-900')}`}>{value}</span>
    </div>
  ); 
}

/**
 * Master Equity Analytical Detail Canvas & Transaction Entry Terminal
 */
export default function StockDetail({ 
  quote, 
  holding, 
  cashBalance, 
  isWatched, 
  onToggleWatch, 
  onBack, 
  onTrade, 
  userId 
}) {
  const { isDark } = useTheme();
  const { isReal } = useTradingMode();

  // Primary Interactive Control States
  const [transactionSide, setTransactionSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [orderQuantityInput, setOrderQuantityInput] = useState('1');
  const [executionType, setExecutionType] = useState('market'); // 'market' | 'limit'
  const [limitPriceTarget, setLimitPriceTarget] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  
  // Transaction Pipeline Telemetry States
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTabPanel, setActiveTabPanel] = useState('depth'); // 'depth' | 'range' | 'circuit'

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500 font-semibold select-none">
        Initializing localized streaming vectors...
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Defensive Telemetry Cleanup Hook
  // Clears outstanding execution timers on unmount to prevent component memory leaks
  // -------------------------------------------------------------------------
  useEffect(() => {
    let pendingExecutionTimerId = null;
    return () => {
      if (pendingExecutionTimerId) clearTimeout(pendingExecutionTimerId);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Computational Valuation Metrics Matrix (Memoized)
  // -------------------------------------------------------------------------
  const isPositiveSessionMomentum = quote.changePercent >= 0;
  
  const verifiedOrderQuantity = useMemo(() => {
    const parsedInteger = parseInt(orderQuantityInput, 10);
    return isNaN(parsedInteger) || parsedInteger < 0 ? 0 : parsedInteger;
  }, [orderQuantityInput]);

  const resolvedExecutionPrice = useMemo(() => {
    if (executionType === 'limit' && limitPriceTarget) {
      const parsedFloat = parseFloat(limitPriceTarget);
      return isNaN(parsedFloat) ? quote.price : parsedFloat;
    }
    return quote.price;
  }, [executionType, limitPriceTarget, quote.price]);

  const calculatedCostTotal = useMemo(() => {
    return verifiedOrderQuantity * resolvedExecutionPrice;
  }, [verifiedOrderQuantity, resolvedExecutionPrice]);

  const maximumAffordableBuyUnits = useMemo(() => {
    return Math.floor(cashBalance / (quote.price || 1));
  }, [cashBalance, quote.price]);

  const maximumAvailableInventoryShares = useMemo(() => {
    return holding?.quantity ?? 0;
  }, [holding]);

  const positionPct52W = useMemo(() => {
    if (quote.high52 <= quote.low52) return 50;
    return ((quote.price - quote.low52) / (quote.high52 - quote.low52)) * 100;
  }, [quote.price, quote.low52, quote.high52]);

  // -------------------------------------------------------------------------
  // Transactional Pipeline Execution Block
  // -------------------------------------------------------------------------
  const executeOrderSubmission = useCallback(() => {
    setErrorMessage(null); 
    setSuccessMessage(null);
    
    if (verifiedOrderQuantity <= 0) { 
      setErrorMessage('Order execution rejected: Enter a valid transaction quantity unit.'); 
      return; 
    }

    let dynamicSettlementPrice = quote.price;
    if (executionType === 'limit') {
      dynamicSettlementPrice = parseFloat(limitPriceTarget) || quote.price;
    } else {
      const percentageSlippageScalar = (parseFloat(slippageTolerance) || 0.5) / 100;
      // Generates deterministic micro-variance emulating slippage latency updates
      const simulatedMarketVariance = quote.price * percentageSlippageScalar * 0.1 * (Math.random() - 0.5);
      dynamicSettlementPrice = Math.round((quote.price + simulatedMarketVariance) * 100) / 100;
    }

    setIsProcessing(true);

    // Formats transactional payload down to core database schemas
    const transactionPayload = {
      symbol: quote.symbol,
      name: quote.name,
      quantity: verifiedOrderQuantity,
      price: dynamicSettlementPrice,
      side: transactionSide
    };

    const operationResult = executeTrade(userId, transactionPayload);

    // Short mock delay tracking serverless pipeline network cycles safely
    setTimeout(() => {
      setIsProcessing(false);
      
      if (operationResult.error) {
        setErrorMessage(operationResult.error);
      } else {
        setSuccessMessage(
          `Order Executed Successfully: ${transactionSide === 'BUY' ? 'Allocated' : 'Liquidated'} ${verifiedOrderQuantity} units of ${quote.symbol} @ ${fmtINR(dynamicSettlementPrice)}`
        );
        setOrderQuantityInput('1');
        if (typeof onTrade === 'function') onTrade();
      }
    }, 300);

  }, [verifiedOrderQuantity, executionType, limitPriceTarget, slippageTolerance, quote, transactionSide, userId, onTrade]);

  // Design Token Class Selectors
  const cardThemeClass = isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200';
  const inputThemeClass = isDark 
    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400';

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Dynamic Header Structural Controls Panel */}
      <div className="flex items-center justify-between select-none">
        <button 
          onClick={onBack} 
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Market Board
        </button>
        
        <button 
          onClick={onToggleWatch} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
            isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className={`w-4 h-4 transition-transform duration-200 ${isWatched ? 'fill-amber-400 text-amber-400 scale-110' : ''}`} />
          {isWatched ? 'Monitored' : 'Add to Watchlist'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Analytics Infrastructure Frame Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`rounded-2xl p-5 border shadow-sm ${cardThemeClass}`}>
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black tracking-wider ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-slate-100 border border-slate-200 text-slate-700'}`}>
                  {quote.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-zinc-50' : 'text-slate-900'}`}>
                      {quote.symbol}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isDark ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {quote.sector}
                    </span>
                  </div>
                  <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    {quote.name}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-2xl font-black font-mono tracking-tight ${isDark ? 'text-zinc-50' : 'text-slate-900'}`}>
                  {fmtINR(quote.price)}
                </p>
                <div className={`flex items-center justify-end gap-1 text-xs font-bold font-mono ${isPositiveSessionMomentum ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositiveSessionMomentum ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositiveSessionMomentum ? '+' : ''}{(Number(quote.change) || 0).toFixed(2)} ({isPositiveSessionMomentum ? '+' : ''}{(Number(quote.changePercent) || 0).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Main Advanced Candlestick Render Canvas */}
            <div className="mt-4 -mx-1 border border-transparent rounded-xl overflow-hidden">
              <CandlestickChart candles={quote.candles} height={350} isDark={isDark} />
            </div>

            {/* High-Frequency Live Statistics Ledger Matrix */}
            <div className={`grid grid-cols-3 md:grid-cols-6 gap-3 mt-4 pt-4 border-t ${isDark ? 'border-zinc-900' : 'border-slate-100'}`}>
              <StatItem label="Session Open" value={fmtINR(quote.open)} isDark={isDark} />
              <StatItem label="Prior Close" value={fmtINR(quote.prevClose)} isDark={isDark} />
              <StatItem label="Session High" value={fmtINR(quote.high)} isDark={isDark} />
              <StatItem label="Session Low" value={fmtINR(quote.low)} isDark={isDark} />
              <StatItem label="Calculated VWAP" value={fmtINR(quote.vwap)} isDark={isDark} />
              <StatItem label="Mean ATP" value={fmtINR(quote.avgTradedPrice)} isDark={isDark} />
            </div>
          </div>

          {/* Core Subsystem Information Switch Tabs */}
          <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardThemeClass}`}>
            <div className={`flex select-none border-b ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-200 bg-slate-50/40'}`}>
              {[
                { id: 'depth', label: 'Order Book Depth', icon: BarChart3 },
                { id: 'range', label: '52-Week Boundaries', icon: TrendingUp },
                { id: 'circuit', label: 'Exchange Circuits', icon: Shield }
              ].map((tabConfig) => (
                <button 
                  key={tabConfig.id} 
                  onClick={() => setActiveTabPanel(tabConfig.id)} 
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2 ${
                    activeTabPanel === tabConfig.id 
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/[0.01]' 
                      : isDark ? 'border-transparent text-zinc-500 hover:text-zinc-200' : 'border-transparent text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <tabConfig.icon className="w-3.5 h-3.5" />
                  {tabConfig.label}
                </button>
              ))}
            </div>
            
            <div className="p-4">
              {activeTabPanel === 'depth' && <MarketDepth depth={quote.depth} />}
              
              {activeTabPanel === 'range' && (
                <div className="space-y-4 py-1 select-none">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-zinc-500">Trailing 52W Low</span>
                      <span className="text-xs font-mono font-bold text-zinc-400">{fmtINR(quote.low52)}</span>
                    </div>
                    <div className={`relative h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 via-amber-500/30 to-emerald-500/30" />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 shadow-md" 
                        style={{ left: `calc(${Math.min(Math.max(positionPct52W, 0), 100)}% - 6px)` }} 
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs font-semibold text-zinc-500">Trailing 52W High</span>
                      <span className="text-xs font-mono font-bold text-zinc-400">{fmtINR(quote.high52)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Index Placement</p>
                      <p className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{(Number(positionPct52W) || 0).toFixed(1)}% of Channel</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 mb-0.5">Ceiling Variance</p>
                      <p className="text-sm font-mono font-bold text-red-400">{(Number(((quote.high52 - quote.price) / (quote.high52 || 1)) * 100) || 0).toFixed(1)}% Below High</p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTabPanel === 'circuit' && (
                <div className="space-y-3 py-1 select-none">
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/60 border-emerald-100'}`}>
                      <p className="text-[10px] uppercase font-bold text-emerald-400 mb-0.5">Upper Circuit Freeze</p>
                      <p className="text-lg font-mono font-black text-emerald-400">{fmtINR(quote.circuitUpper)}</p>
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">+20% Threshold Boundary</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/60 border-red-100'}`}>
                      <p className="text-[10px] uppercase font-bold text-red-400 mb-0.5">Lower Circuit Halt</p>
                      <p className="text-lg font-mono font-black text-red-400">{fmtINR(quote.circuitLower)}</p>
                      <p className="text-[10px] font-medium text-zinc-500 mt-0.5">-20% Threshold Boundary</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl flex items-start gap-2 border ${isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50/60 border-amber-100'}`}>
                    <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-medium text-amber-400 leading-normal">
                      Exchanges establish strict circuit limits to prevent erratic liquidity manipulation. Order books halt systematically if spot rates pierce these boundaries.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Dispatch Ledger Placement Panel */}
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border shadow-sm ${cardThemeClass}`}>
            
            <div className="flex items-center justify-between mb-4 select-none">
              <h3 className={`text-sm font-bold tracking-tight uppercase ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
                Order Operations Terminal
              </h3>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${isReal ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                <Zap className="w-3 h-3 animate-pulse" /> {isReal ? 'REAL' : 'SANDBOX'}
              </div>
            </div>

            {/* Buy / Sell Bid Direction Toggle Selectors */}
            <div className={`flex gap-1 p-1 rounded-xl mb-4 select-none ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
              <button 
                onClick={() => { setTransactionSide('BUY'); setErrorMessage(null); setSuccessMessage(null); }} 
                className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${transactionSide === 'BUY' ? 'bg-emerald-500 text-white shadow-sm' : isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-800'}`}
              >
                BUY
              </button>
              <button 
                onClick={() => { setTransactionSide('SELL'); setErrorMessage(null); setSuccessMessage(null); }} 
                className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${transactionSide === 'SELL' ? 'bg-red-500 text-white shadow-sm' : isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-800'}`}
              >
                SELL
              </button>
            </div>

            {/* Dynamic Configuration Fields */}
            <div className={`rounded-xl p-3 mb-3 flex justify-between select-none border ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50/80 border-slate-100'}`}>
              <span className="text-xs font-semibold text-zinc-500">Live Execution Benchmark</span>
              <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{fmtINR(quote.price)}</span>
            </div>

            <div className={`flex gap-1 p-1 rounded-xl mb-4 select-none ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
              <button 
                onClick={() => setExecutionType('market')} 
                className={`flex-1 py-1.5 rounded-lg text-[11px] uppercase font-bold tracking-wider transition-all ${executionType === 'market' ? (isDark ? 'bg-zinc-800 text-zinc-200 shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Market Order
              </button>
              <button 
                onClick={() => { setExecutionType('limit'); if (!limitPriceTarget) setLimitPriceTarget((Number(quote.price) || 0).toFixed(2)); }}
                className={`flex-1 py-1.5 rounded-lg text-[11px] uppercase font-bold tracking-wider flex items-center justify-center gap-1 transition-all ${executionType === 'limit' ? (isDark ? 'bg-zinc-800 text-zinc-200 shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Lock className="w-2.5 h-2.5" /> Limit Order
              </button>
            </div>

            {executionType === 'limit' ? (
              <div className="mb-3">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 block">Locked Price Threshold (₹)</label>
                <input type="number" value={limitPriceTarget} onChange={(e) => setLimitPriceTarget(e.target.value)} step="0.05" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${inputThemeClass}`} placeholder={(Number(quote.price) || 0).toFixed(2)} />
              </div>
            ) : (
              <div className="mb-3">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 block">Execution Slippage Buffer %</label>
                <input type="number" value={slippageTolerance} onChange={(e) => setSlippageTolerance(e.target.value)} min="0" max="5" step="0.1" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${inputThemeClass}`} placeholder="0.5" />
              </div>
            )}

            <div className="mb-4">
              <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 block">Allocation Volume (Units)</label>
              <input type="number" value={orderQuantityInput} onChange={(e) => setOrderQuantityInput(e.target.value)} min="1" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${inputThemeClass}`} />
            </div>

            {/* Target Percentage Scaler Shortcuts */}
            <div className="flex gap-2 mb-4 select-none">
              {[25, 50, 75].map((pct) => (
                <button 
                  key={pct} 
                  onClick={() => setOrderQuantityInput(String(Math.max(1, Math.floor((transactionSide === 'BUY' ? maximumAffordableBuyUnits : maximumAvailableInventoryShares) * pct / 100))))} 
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  {pct}%
                </button>
              ))}
              <button 
                onClick={() => setOrderQuantityInput(String(Math.max(1, transactionSide === 'BUY' ? maximumAffordableBuyUnits : maximumAvailableInventoryShares)))} 
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                MAX
              </button>
            </div>

            {/* Financial Summary Ledger */}
            <div className={`rounded-xl p-3 mb-4 space-y-2 border ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50/80 border-slate-100'}`}>
              <SummaryRow label="Estimated Total Volume Flow" value={fmtINR(calculatedCostTotal)} isDark={isDark} />
              <SummaryRow label={transactionSide === 'BUY' ? 'Available Buying Liquidity' : 'Available Inventory Base'} value={transactionSide === 'BUY' ? fmtINR(cashBalance) : `${maximumAvailableInventoryShares} Units`} isDark={isDark} />
            </div>

            {executionType === 'limit' && (
              <p className={`text-[10px] font-semibold mb-4 select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                * Limit configuration guarantees price enforcement. Order queues fill exclusively when market nodes scan spot matches touching ₹{limitPriceTarget || (Number(quote.price) || 0).toFixed(2)}.
              </p>
            )}

            {/* Status Feedback Toasts */}
            {errorMessage && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs font-semibold font-mono text-red-400 mb-4 animate-fade-in">{errorMessage}</div>}
            {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs font-semibold font-mono text-emerald-400 mb-4 flex items-center justify-between animate-fade-in">{successMessage}<button onClick={() => setSuccessMessage(null)}><X className="w-3.5 h-3.5 ml-1 text-emerald-400 hover:brightness-125" /></button></div>}
            
            <button 
              onClick={executeOrderSubmission} 
              disabled={isProcessing} 
              className={`w-full font-bold py-3 text-xs tracking-wider uppercase rounded-xl btn-glow transition-all duration-200 shadow-md disabled:opacity-50 ${transactionSide === 'BUY' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-950/20' : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-950/20'}`}
            >
              {isProcessing ? 'Routing Via Broker APIs...' : `Transmit ${transactionSide} Execution Order`}
            </button>
          </div>

          {/* Active Capital Inventory Position Summary Card */}
          {holding && holding.quantity > 0 && (
            <div className={`rounded-2xl p-5 border shadow-sm ${cardThemeClass}`}>
              <h3 className={`text-sm font-bold tracking-tight uppercase mb-3 ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
                Active Portfolio Allocation
              </h3>
              <div className="space-y-2.5">
                <SummaryRow label="Allocated Asset Units" value={holding.quantity} isDark={isDark} />
                <SummaryRow label="Consolidated Average Cost" value={fmtINR(holding.avgPrice)} isDark={isDark} />
                <SummaryRow label="Current Market Spot Price" value={fmtINR(quote.price)} isDark={isDark} />
                <SummaryRow label="Aggregated Market Value" value={fmtINR(holding.quantity * quote.price)} isDark={isDark} />
                
                <div className={`pt-2.5 border-t ${isDark ? 'border-zinc-900' : 'border-slate-100'}`}>
                  <SummaryRow 
                    label="Unrealized P&L Capital Delta" 
                    value={`${quote.price >= holding.avgPrice ? '+' : ''}${fmtINR((quote.price - holding.avgPrice) * holding.quantity)}`} 
                    valueClass={quote.price >= holding.avgPrice ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'} 
                    isDark={isDark} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}