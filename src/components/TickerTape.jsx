import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized High-Frequency Ticker Item Node
 * Optimized via React.memo to prevent localized text re-paints unless asset parameters vary.
 */
const TickerTapeItem = React.memo(({ quote, isDark }) => {
  const isPositiveDelta = quote.changePercent >= 0;

  return (
    <div className="flex items-center gap-1.5 text-xs select-none">
      <span className={`font-bold tracking-tight ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
        {quote.symbol}
      </span>
      <span className={`font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
        {fmtINR(quote.price)}
      </span>
      <div className={`flex items-center gap-0.5 font-mono font-bold ${
        isPositiveDelta ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositiveDelta ? '+' : ''}{quote.changePercent.toFixed(2)}%
      </div>
      <span className={`w-px h-3 ml-2.5 opacity-60 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />
    </div>
  );
});

TickerTapeItem.displayName = 'TickerTapeItem';

/**
 * Master Real-Time Stream Ticker Tape Horizon Component
 */
export default function TickerTape({ quotes }) {
  const { isDark } = useTheme();

  // High-Performance Infinite Loop Concatenation Pipeline
  // Memoizes the array duplication layer to prevent garbage collection spikes.

  const combinedTickerDataset = useMemo(() => {
    if (!quotes || quotes.size === 0) return [];
    
    const flattenedQuotesArray = Array.from(quotes.values());
    
    // Duplicates the array dataset cleanly to construct a seamless infinite visual pipeline carousel
    return [...flattenedQuotesArray, ...flattenedQuotesArray];
  }, [quotes]);

  if (combinedTickerDataset.length === 0) return null;

  return (
    <div 
      className={`overflow-hidden border-b py-2 select-none transition-colors duration-200 ${
        isDark 
          ? 'border-zinc-900/40 bg-zinc-950/20' 
          : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div 
        className="ticker-inner flex items-center gap-6 whitespace-nowrap" 
        style={{ width: 'max-content' }}
      >
        {combinedTickerDataset.map((item, index) => (
          <TickerTapeItem
            // Combines index with symbol to guarantee a unique tracking identifier across duplicated bands
            key={`${item.symbol}-ticker-${index}`}
            quote={item}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}