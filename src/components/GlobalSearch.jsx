import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { STOCKS } from '../lib/stocks.js';
import { fmtINR } from '../lib/marketEngine.js';

const SearchResultRow = React.memo(({ stock, liveQuote, isActive, onSelect, onMouseEnter, isDark }) => {
  const isPositiveDelta = (liveQuote?.changePercent ?? 0) >= 0;

  return (
    <button 
      onClick={onSelect} 
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-150 outline-none select-none ${
        isActive 
          ? isDark ? 'bg-zinc-900/60' : 'bg-slate-50' 
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border uppercase tracking-wider ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          {stock.symbol.slice(0, 3)}
        </div>
        <div className="text-left">
          <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            {stock.symbol}
          </p>
          <p className="text-[10px] font-medium text-zinc-500">
            {stock.name}
          </p>
        </div>
      </div>
      
      {liveQuote && (
        <div className="text-right">
          <p className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
            {fmtINR(liveQuote.price)}
          </p>
          <div className={`flex items-center justify-end gap-0.5 text-[11px] font-mono font-bold ${
            isPositiveDelta ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isPositiveDelta ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositiveDelta ? '+' : ''}{liveQuote.changePercent.toFixed(2)}%
          </div>
        </div>
      )}
    </button>
  );
});

SearchResultRow.displayName = 'SearchResultRow';

export default function GlobalSearch({ quotes, isOpen, onClose, onSelectStock }) {
  const { isDark } = useTheme();
  
  // Modal Operational Input Control States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelectionIndex, setActiveSelectionIndex] = useState(0);
  
  const searchInputReferenceRef = useRef(null);

  // Synchronizes modal focus pipelines defensively when modal toggle flags shift
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveSelectionIndex(0);
      const focusGraceTimerId = setTimeout(() => searchInputReferenceRef.current?.focus(), 50);
      return () => clearTimeout(focusGraceTimerId);
    }
  }, [isOpen]);

  // High-Performance Lexical Filter String Compilation Pipeline (Memoized)
  const computedQueryResultsMatrix = useMemo(() => {
    const standardizedToken = searchQuery.toUpperCase().trim();
    
    return STOCKS.filter((asset) => {
      if (!standardizedToken) return true;
      return (
        asset.symbol.includes(standardizedToken) || 
        asset.name.toUpperCase().includes(standardizedToken) || 
        asset.sector.toUpperCase().includes(standardizedToken)
      );
    }).slice(0, 8);
  }, [searchQuery]);

  // -------------------------------------------------------------------------
  // Stabilized Keyboard Event Listener Routing Hooks
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboardNavigationEvent = (nativeEvent) => {
      const itemsCountLimit = computedQueryResultsMatrix.length;

      if (nativeEvent.key === 'Escape') {
        nativeEvent.preventDefault();
        onClose?.();
      }
      
      if (nativeEvent.key === 'ArrowDown') {
        nativeEvent.preventDefault();
        setActiveSelectionIndex((currentIndex) => Math.min(currentIndex + 1, itemsCountLimit - 1));
      }
      
      if (nativeEvent.key === 'ArrowUp') {
        nativeEvent.preventDefault();
        setActiveSelectionIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      }
      
      if (nativeEvent.key === 'Enter') {
        nativeEvent.preventDefault();
        const targetedAsset = computedQueryResultsMatrix[activeSelectionIndex];
        if (targetedAsset) {
          onSelectStock?.(targetedAsset.symbol);
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyboardNavigationEvent);
    
    // Explicit cleaning remediation boundary clearing window hooks systematically
    return () => {
      window.removeEventListener('keydown', handleKeyboardNavigationEvent);
    };
  }, [isOpen, computedQueryResultsMatrix, activeSelectionIndex, onClose, onSelectStock]);

  if (!isOpen) return null;

  const modalContainerStyles = isDark ? 'bg-zinc-950 border-zinc-900 shadow-black/60' : 'bg-white border-slate-200 shadow-slate-200/50';

  return (
    <>
      {/* Translucent Backdrop Modal Curtain Layer */}
      <div 
        className="fixed inset-0 z-[130] bg-zinc-950/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Search Overlay Display Dialogue Box */}
      <div 
        className={`fixed left-1/2 top-[15%] -translate-x-1/2 z-[140] w-full max-w-[560px] rounded-2xl shadow-2xl border overflow-hidden animate-scale-in transition-all duration-200 ${modalContainerStyles}`}
      >
        {/* Modal Search Input Tray Bar */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
          <Search className={`w-5 h-5 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
          
          <input 
            ref={searchInputReferenceRef} 
            type="text" 
            value={searchQuery} 
            onChange={(e) => { 
              setSearchQuery(e.target.value); 
              setActiveSelectionIndex(0); 
            }} 
            placeholder="Search equities, corporate tickers, market sectors..." 
            className={`flex-1 bg-transparent text-sm font-semibold focus:outline-none ${
              isDark ? 'text-zinc-100 placeholder-zinc-700' : 'text-slate-900 placeholder-slate-400'
            }`} 
          />
          
          <kbd className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold select-none border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Dynamic Query Result Dropdown Lane Container */}
        <div className="max-h-[380px] overflow-y-auto py-1">
          {computedQueryResultsMatrix.length === 0 ? (
            <div className={`py-12 text-center text-xs font-bold tracking-wide select-none ${isDark ? 'text-zinc-600' : 'text-slate-500'}`}>
              Zero records match current metrics profile.
            </div>
          ) : (
            computedQueryResultsMatrix.map((stockNode, idx) => (
              <SearchResultRow
                key={stockNode.symbol}
                stock={stockNode}
                liveQuote={quotes?.get(stockNode.symbol)}
                isActive={idx === activeSelectionIndex}
                onMouseEnter={() => setActiveSelectionIndex(idx)}
                onSelect={() => {
                  onSelectStock?.(stockNode.symbol);
                  onClose?.();
                }}
                isDark={isDark}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}