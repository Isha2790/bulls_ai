import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Flame, ArrowDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized High-Frequency List Row Item Component
 * Encapsulated via React.memo to completely bypass unnecessary re-renders.
 */
const MoverRow = React.memo(({ quote, rank, isDark, onSelect }) => {
  const isPositiveDelta = quote.changePercent >= 0;

  return (
    <button 
      onClick={onSelect} 
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all duration-150 group border border-transparent outline-none ${
        isDark 
          ? 'hover:bg-zinc-900/60 hover:border-zinc-800/40' 
          : 'hover:bg-slate-50 hover:border-slate-200/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-700' : 'text-slate-300'}`}>
          {rank.toString().padStart(2, '0')}
        </span>
        <div className="text-left">
          <p className={`text-sm font-bold tracking-tight transition-transform duration-150 group-hover:translate-x-0.5 ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            {quote.symbol}
          </p>
          <p className={`text-xs font-mono font-semibold ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            {fmtINR(quote.price)}
          </p>
        </div>
      </div>
      
      <div className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
        isPositiveDelta 
          ? 'text-emerald-400 bg-emerald-500/5' 
          : 'text-red-400 bg-red-500/5'
      }`}>
        {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositiveDelta ? '+' : ''}{quote.changePercent.toFixed(2)}%
      </div>
    </button>
  );
});

MoverRow.displayName = 'MoverRow';

/**
 * Master Equity Performance Momentum Subsystem Block Component
 */
export default function TopMovers({ quotes, onSelectStock }) {
  const { isDark } = useTheme();

  // High-Performance Structural Data Compilation Pipeline
  // Calculates gainers and losers in a single processing sequence pass.
  const [topGainersMatrix, topLosersMatrix] = useMemo(() => {
    if (!quotes || quotes.size === 0) return [[], []];

    // Transpile map stream instances cleanly to array format parameters
    const flattenedAssetsArray = Array.from(quotes.values());

    // Sort the base map snapshot once globally to optimize algorithmic operations
    const globallySortedBasket = flattenedAssetsArray.sort((alpha, beta) => beta.changePercent - alpha.changePercent);

    const gainersOut = globallySortedBasket.slice(0, 5);
    
    // Safely reads from the tail of the pre-sorted list, avoiding a second sort operation
    const losersOut = globallySortedBasket.slice(-5).reverse();

    return [gainersOut, losersOut];
  }, [quotes]);

  if (topGainersMatrix.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* Top Gainers Matrix Sector Card */}
      <div 
        className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
          isDark 
            ? 'bg-zinc-950/40 border-zinc-900' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-3 select-none">
          <Flame className="w-4 h-4 text-emerald-400" />
          <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Session Gainers Top 5
          </h3>
        </div>
        <div className="space-y-1.5">
          {topGainersMatrix.map((item, index) => (
            <MoverRow 
              key={item.symbol} 
              quote={item} 
              rank={index + 1} 
              isDark={isDark} 
              onSelect={() => onSelectStock?.(item.symbol)} 
            />
          ))}
        </div>
      </div>

      {/* Top Losers Matrix Sector Card */}
      <div 
        className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
          isDark 
            ? 'bg-zinc-950/40 border-zinc-900' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-3 select-none">
          <ArrowDown className="w-4 h-4 text-red-400" />
          <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Session Decliners Top 5
          </h3>
        </div>
        <div className="space-y-1.5">
          {topLosersMatrix.map((item, index) => (
            <MoverRow 
              key={item.symbol} 
              quote={item} 
              rank={index + 1} 
              isDark={isDark} 
              onSelect={() => onSelectStock?.(item.symbol)} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}