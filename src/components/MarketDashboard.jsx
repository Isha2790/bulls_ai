import React, { useState, useMemo, useCallback } from 'react';
import MiniSparkline from './MiniSparkline.jsx';
import { Star, Search, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

function formatVolumeMetric(volumeValue) {
  if (!volumeValue || isNaN(volumeValue)) return '—';
  if (volumeValue >= 1e7) return (volumeValue / 1e7).toFixed(2) + 'Cr';
  if (volumeValue >= 1e5) return (volumeValue / 1e5).toFixed(2) + 'L';
  if (volumeValue >= 1e3) return (volumeValue / 1e3).toFixed(1) + 'K';
  return String(volumeValue);
}

const TelemetrySummaryCard = React.memo(({ label, value, valueClass = '', icon, isDark }) => (
  <div 
    className={`rounded-xl p-4 border shadow-sm select-none transition-all duration-150 ${
      isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200'
    }`}
  >
    <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
      {label}
    </p>
    <div className="flex items-center gap-2">
      {icon}
      <p className={`text-base font-black font-mono tracking-tight ${valueClass || (isDark ? 'text-zinc-200' : 'text-slate-900')}`}>
        {value}
      </p>
    </div>
  </div>
));

TelemetrySummaryCard.displayName = 'TelemetrySummaryCard';

/**
 * Standardized High-Performance Dashboard Asset Row Component
 */
const DashboardAssetRow = React.memo(({ quote, isWatched, onToggleWatch, onSelect, isDark }) => {
  const isPositiveYield = quote.changePercent >= 0;

  // Memoizes candle cutting array mutations to protect memory spaces from loops drops
  const subsetCandles = useMemo(() => {
    return quote.candles ? quote.candles.slice(-20) : [];
  }, [quote.candles]);

  return (
    <tr 
      onClick={onSelect} 
      className={`border-b cursor-pointer transition-colors duration-150 select-none ${
        isDark ? 'border-zinc-900 hover:bg-zinc-900/40' : 'border-slate-100 hover:bg-slate-50/80'
      }`}
    >
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onToggleWatch}
          className="outline-none transition-transform duration-150 active:scale-90"
          title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Star className={`w-4 h-4 transition-colors ${
            isWatched ? 'fill-amber-400 text-amber-400' : isDark ? 'text-zinc-800 hover:text-zinc-600' : 'text-slate-200 hover:text-slate-400'
          }`} />
        </button>
      </td>
      
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border uppercase tracking-wider ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            {quote.symbol.slice(0, 3)}
          </div>
          <div>
            <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              {quote.symbol}
            </p>
            <p className="text-[10px] font-medium text-zinc-500 truncate max-w-[140px] hidden sm:block">
              {quote.name}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4 text-right hidden md:table-cell">
        <span className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
          {fmtINR(quote.price)}
        </span>
      </td>
      
      <td className="py-3 px-4 text-right">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
          isPositiveYield ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositiveYield ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositiveYield ? '+' : ''}{quote.changePercent.toFixed(2)}%
        </div>
      </td>
      
      <td className="py-3 px-4 text-right hidden lg:table-cell">
        <span className={`text-xs font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {formatVolumeMetric(quote.volume)}
        </span>
      </td>
      
      <td className="py-3 px-4 hidden md:table-cell">
        <div className="flex justify-center items-center h-full">
          <MiniSparkline data={subsetCandles} positive={isPositiveYield} symbol={quote.symbol} />
        </div>
      </td>
    </tr>
  );
});

DashboardAssetRow.displayName = 'DashboardAssetRow';

/**
 * Master Market Dashboard Data Table & Aggregator Subsystem Component
 */
export default function MarketDashboard({ quotes, watchlist = [], onToggleWatch, onSelectStock }) {
  const { isDark } = useTheme();
  
  // Local Table Filtering Control States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortingKeyParameter, setSortingKeyParameter] = useState('changePercent');
  const [sortingDirectionFlag, setSortingDirectionFlag] = useState('desc'); // 'asc' | 'desc'
  const [activeFilterSegment, setActiveFilterSegment] = useState('all'); // 'all' | 'gainers' | 'losers' | 'watchlist'

  // Filtering & Analytical Aggregator Matrices (Memoized)
  const processedFilteredCollection = useMemo(() => {
    if (!quotes) return [];
    let initialQuotesList = Array.from(quotes.values());
    
    if (searchQuery) {
      const standardQueryStr = searchQuery.toUpperCase().trim();
      initialQuotesList = initialQuotesList.filter(
        (asset) => asset.symbol.includes(standardQueryStr) || asset.name.toUpperCase().includes(standardQueryStr)
      );
    }
    
    if (activeFilterSegment === 'gainers') initialQuotesList = initialQuotesList.filter((asset) => asset.changePercent > 0);
    if (activeFilterSegment === 'losers') initialQuotesList = initialQuotesList.filter((asset) => asset.changePercent < 0);
    if (activeFilterSegment === 'watchlist') initialQuotesList = initialQuotesList.filter((asset) => watchlist.includes(asset.symbol));
    
    initialQuotesList.sort((alpha, beta) => {
      let comparativeIndicator = sortingKeyParameter === 'symbol' 
        ? alpha.symbol.localeCompare(beta.symbol) 
        : alpha[sortingKeyParameter] - beta[sortingKeyParameter];
        
      return sortingDirectionFlag === 'asc' ? comparativeIndicator : -comparativeIndicator;
    });
    
    return initialQuotesList;
  }, [quotes, searchQuery, sortingKeyParameter, sortingDirectionFlag, activeFilterSegment, watchlist]);

  const compositeMarketStatsMatrix = useMemo(() => {
    if (!quotes) return { gainers: 0, losers: 0, avgChange: 0 };
    const globalQuotesArray = Array.from(quotes.values());
    if (globalQuotesArray.length === 0) return { gainers: 0, losers: 0, avgChange: 0 };

    return {
      gainers: globalQuotesArray.filter((asset) => asset.changePercent > 0).length,
      losers: globalQuotesArray.filter((asset) => asset.changePercent < 0).length,
      avgChange: globalQuotesArray.reduce((acc, asset) => acc + asset.changePercent, 0) / globalQuotesArray.length
    };
  }, [quotes]);

  const compiledPipelineStatus = useMemo(() => {
    if (!quotes || quotes.size === 0) return 'SIM';
    const globalQuotesList = Array.from(quotes.values());
    const onlineStreamNodes = globalQuotesList.filter((asset) => asset.isLive).length;
    return onlineStreamNodes > globalQuotesList.length / 2 ? 'LIVE' : 'SIM';
  }, [quotes]);

  // Interactive Column Sorting Handlers Callback
  const triggerSortTransformation = useCallback((targetKey) => {
    setSortingKeyParameter((currentKey) => {
      if (currentKey === targetKey) {
        setSortingDirectionFlag((currentDir) => (currentDir === 'asc' ? 'desc' : 'asc'));
        return currentKey;
      } else {
        setSortingDirectionFlag('desc');
        return targetKey;
      }
    });
  }, []);

  // Reusable Sorting Header Column Layout Injector Component
  const SortHeader = ({ targetKey, titleLabel, alignmentStyle = '' }) => (
    <th 
      onClick={() => triggerSortTransformation(targetKey)}
      className={`py-3 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors duration-150 ${alignmentStyle} ${
        isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-900'
      }`}
    >
      <span className={`inline-flex items-center gap-1 ${alignmentStyle.includes('text-right') ? 'justify-end w-full' : ''}`}>
        {titleLabel}
        <ArrowUpDown className={`w-3 h-3 transition-colors duration-150 ${
          sortingKeyParameter === targetKey 
            ? 'text-emerald-400' 
            : isDark ? 'text-zinc-800' : 'text-slate-200'
        }`} />
      </span>
    </th>
  );

  const cardBorderContainerStyles = isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200';

  return (
    <div className="space-y-4">
      
      {/* Structural Account Telemetry Summary Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TelemetrySummaryCard 
          label="Engine Status" 
          value={compiledPipelineStatus} 
          valueClass={compiledPipelineStatus === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'} 
          isDark={isDark} 
          icon={<span className={`w-2 h-2 rounded-full ${compiledPipelineStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />} 
        />
        
        <TelemetrySummaryCard label="Market Advances" value={compositeMarketStatsMatrix.gainers} valueClass="text-emerald-400" isDark={isDark} />
        <TelemetrySummaryCard label="Market Declines" value={compositeMarketStatsMatrix.losers} valueClass="text-red-400" isDark={isDark} />
        
        <TelemetrySummaryCard 
          label="Mean Session Change" 
          value={`${compositeMarketStatsMatrix.avgChange >= 0 ? '+' : ''}${compositeMarketStatsMatrix.avgChange.toFixed(2)}%`} 
          valueClass={compositeMarketStatsMatrix.avgChange >= 0 ? 'text-emerald-400' : 'text-red-400'} 
          isDark={isDark} 
        />
      </div>

      {/* Operational Filter Action Controls Header Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search by equity symbol or institutional index profile..." 
            className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-500/20 ${
              isDark 
                ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/40' 
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400'
            }`} 
          />
        </div>
        
        <div className={`flex gap-1 p-1 rounded-xl select-none border ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50 border-slate-200'}`}>
          {['all', 'gainers', 'losers', 'watchlist'].map((filterSegmentKey) => (
            <button 
              key={filterSegmentKey} 
              onClick={() => setActiveFilterSegment(filterSegmentKey)} 
              className={`px-3.5 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wide transition-all duration-150 ${
                activeFilterSegment === filterSegmentKey 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              {filterSegmentKey === 'all' ? 'Core Market' : filterSegmentKey}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Data Display Matrix Core Grid Frame */}
      <div className={`rounded-2xl overflow-hidden border shadow-sm transition-all duration-200 ${cardBorderContainerStyles}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/20' : 'border-slate-200 bg-slate-50/60'}`}>
                <th className="w-10 py-3 px-4"></th>
                <SortHeader targetKey="symbol" titleLabel="Asset Token" />
                <SortHeader targetKey="price" titleLabel="Spot Price" alignmentStyle="text-right hidden md:table-cell" />
                <SortHeader targetKey="changePercent" titleLabel="Session Delta" alignmentStyle="text-right" />
                <SortHeader targetKey="volume" titleLabel="Traded Flow" alignmentStyle="text-right hidden lg:table-cell" />
                <th className={`text-center py-3 px-4 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden md:table-cell`}>
                  Historical Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {processedFilteredCollection.map((quoteItem) => (
                <DashboardAssetRow
                  key={`dashboard-row-${quoteItem.symbol}`}
                  quote={quoteItem}
                  isWatched={watchlist.includes(quoteItem.symbol)}
                  onToggleWatch={() => onToggleWatch?.(quoteItem.symbol)}
                  onSelect={() => onSelectStock?.(quoteItem.symbol)}
                  isDark={isDark}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {processedFilteredCollection.length === 0 && (
          <div className={`py-16 text-center text-sm font-bold tracking-wide select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            Zero asset entities resolved within localized search metrics frameworks.
          </div>
        )}
      </div>

    </div>
  );
}