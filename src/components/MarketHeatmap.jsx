import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

const HeatmapCell = React.memo(({ quote, onSelect, isDark }) => {
  const percentageDelta = quote.changePercent ?? 0;
  const isPositiveDelta = percentageDelta >= 0;

  // Memoizes style tokens to compute dynamic RGBA strings strictly when the individual asset delta changes
  const cellularStyleMetrics = useMemo(() => {
    const dynamicIntensity = Math.min(Math.abs(percentageDelta) / 3, 1);
    
    const alphaBackgroundChannel = 0.08 + dynamicIntensity * 0.25;
    const alphaBorderChannel = 0.15 + dynamicIntensity * 0.20;

    return {
      backgroundColor: isPositiveDelta 
        ? `rgba(16, 185, 129, ${alphaBackgroundChannel})` 
        : `rgba(239, 68, 68, ${alphaBackgroundChannel})`,
      borderColor: isPositiveDelta 
        ? `rgba(16, 185, 129, ${alphaBorderChannel})` 
        : `rgba(239, 68, 68, ${alphaBorderChannel})`
    };
  }, [percentageDelta, isPositiveDelta]);

  return (
    <button 
      onClick={onSelect} 
      className="heatmap-cell flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 transform hover:scale-[1.03] outline-none select-none"
      style={{ ...cellularStyleMetrics, minHeight: 64 }}
    >
      <span className={`text-[10px] font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
        {quote.symbol}
      </span>
      <span className={`text-[9px] font-mono font-bold mt-0.5 ${isPositiveDelta ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositiveDelta ? '+' : ''}{percentageDelta.toFixed(2)}%
      </span>
    </button>
  );
});

HeatmapCell.displayName = 'HeatmapCell';

/**
 * Master Relational Market Heatmap Mosaic Matrix Subsystem Component
 */
export default function MarketHeatmap({ quotes, onSelectStock }) {
  const { isDark } = useTheme();

  // Memoizes the collection conversion pass to maintain reference integrity during pipeline ticks
  const normalizedQuotesMatrix = useMemo(() => {
    if (!quotes || quotes.size === 0) return [];
    
    // Transpiles the Map data entries cleanly to an immutable layout array context sheet
    return Array.from(quotes.values());
  }, [quotes]);

  if (normalizedQuotesMatrix.length === 0) return null;

  return (
    <div 
      className={`rounded-2xl border p-4 shadow-sm transition-colors duration-200 ${
        isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3 select-none">
        <h3 className={`text-sm font-bold tracking-tight uppercase ${isDark ? 'text-zinc-300' : 'text-slate-900'}`}>
          Market Capitalization Heatmap Matrix
        </h3>
      </div>
      
      {/* Dynamic Grid Layout Frame Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {normalizedQuotesMatrix.map((item) => (
          <HeatmapCell
            key={item.symbol}
            quote={item}
            isDark={isDark}
            onSelect={() => onSelectStock?.(item.symbol)}
          />
        ))}
      </div>
    </div>
  );
}