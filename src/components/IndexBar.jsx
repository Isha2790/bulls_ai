import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const IndexMetricItem = React.memo(({ indexData, isDark }) => {
  const isPositiveDelta = indexData.changePercent >= 0;
  const isVolatilityIndex = indexData.name === 'INDIA VIX';

  return (
    <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl whitespace-nowrap select-none">
      <div className="flex items-center gap-1.5">
        {isVolatilityIndex ? (
          <Activity className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
        ) : isPositiveDelta ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        )}
        
        <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          {indexData.name}
        </span>
      </div>

      {/* Localized Currency Value Presentation Mapping Layer */}
      <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
        {indexData.value.toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
      </span>

      <span className={`text-xs font-mono font-bold ${isPositiveDelta ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositiveDelta ? '+' : ''}{indexData.change.toFixed(2)} ({isPositiveDelta ? '+' : ''}{indexData.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
});

IndexMetricItem.displayName = 'IndexMetricItem';


export default function IndexBar({ indices = {} }) {
  const { isDark } = useTheme();

  // High-Performance Data Extraction Pipeline
  // Memoizes the object values array lookup to prevent garbage collection drops
  const normalizedIndicesCollection = useMemo(() => {
    if (!indices) return [];
    
    // Transpiles structural key dictionaries safely into an immutable item array list
    return Object.values(indices).filter(Boolean);
  }, [indices]);

  if (normalizedIndicesCollection.length === 0) return null;

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 border-b overflow-x-auto invisible-scrollbar transition-colors duration-200 ${
        isDark 
          ? 'bg-zinc-950/60 border-zinc-900/60' 
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      {normalizedIndicesCollection.map((indexNode) => (
        <IndexMetricItem
          // Anchors tracking identifiers strictly to unique composite index names
          key={`index-bar-node-${indexNode.name}`}
          indexData={indexNode}
          isDark={isDark}
        />
      ))}
    </div>
  );
}