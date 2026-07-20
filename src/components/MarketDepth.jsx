import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized High-Frequency Bid Order Row Item Component
 */
const BidDepthRow = React.memo(({ bid, maxQty, isDark }) => {
  const quantityWidthPercentage = useMemo(() => {
    if (!maxQty) return 0;
    return (bid.qty / maxQty) * 100;
  }, [bid.qty, maxQty]);

  return (
    <div className="relative flex items-center justify-between py-1.5 px-2 rounded-xl overflow-hidden transition-colors duration-150">
      {/* Background relative volume intensity channel layer */}
      <div 
        className="absolute right-0 top-0 bottom-0 bg-emerald-500/[0.08] transition-all duration-300 ease-out" 
        style={{ width: `${quantityWidthPercentage}%` }} 
      />
      
      <span className="relative text-xs font-mono font-bold text-emerald-400">
        {fmtINR(bid.price)}
      </span>
      <span className={`relative text-xs font-mono font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
        {bid.qty.toLocaleString('en-IN')}
      </span>
    </div>
  );
});

BidDepthRow.displayName = 'BidDepthRow';

/**
 * Standardized High-Frequency Ask Order Row Item Component
 */
const AskDepthRow = React.memo(({ ask, maxQty, isDark }) => {
  const quantityWidthPercentage = useMemo(() => {
    if (!maxQty) return 0;
    return (ask.qty / maxQty) * 100;
  }, [ask.qty, maxQty]);

  return (
    <div className="relative flex items-center justify-between py-1.5 px-2 rounded-xl overflow-hidden transition-colors duration-150">
      {/* Background relative volume intensity channel layer */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-red-500/[0.08] transition-all duration-300 ease-out" 
        style={{ width: `${quantityWidthPercentage}%` }} 
      />
      
      <span className="relative text-xs font-mono font-bold text-red-400">
        {fmtINR(ask.price)}
      </span>
      <span className={`relative text-xs font-mono font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
        {ask.qty.toLocaleString('en-IN')}
      </span>
    </div>
  );
});

AskDepthRow.displayName = 'AskDepthRow';


export default function MarketDepth({ depth }) {
  const { isDark } = useTheme();

  // High-Performance Maximum Peak Quantities Aggregator Matrix (Memoized)
  // Isolates deep loop map checking scans out of rendering streams
  const orderBookLiquidityTelemetry = useMemo(() => {
    if (!depth) return { maxBidQty: 1, maxAskQty: 1 };

    const peakBidVolume = depth.bids?.length > 0 
      ? Math.max(...depth.bids.map((bidItem) => bidItem.qty)) 
      : 1;
      
    const peakAskVolume = depth.asks?.length > 0 
      ? Math.max(...depth.asks.map((askItem) => askItem.qty)) 
      : 1;

    return { 
      maxBidQty: peakBidVolume, 
      maxAskQty: peakAskVolume 
    };
  }, [depth]);

  if (!depth) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      
      {/* BUY SIDE: Liquidity Bid Order Column Panel */}
      <div className="space-y-0.5">
        <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl mb-1.5 select-none border border-transparent ${
          isDark ? 'bg-emerald-500/5 text-emerald-400' : 'bg-emerald-50 text-emerald-700 font-bold border-emerald-100/50'
        }`}>
          <span className="text-xs uppercase font-black tracking-widest">Bids</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Qty</span>
        </div>
        
        {depth.bids.map((item) => (
          <BidDepthRow
            // Utilizes target spot price index as deterministic token mapping keys
            key={`bid-depth-price-${item.price}`}
            bid={item}
            maxQty={orderBookLiquidityTelemetry.maxBidQty}
            isDark={isDark}
          />
        ))}
      </div>

      {/* SELL SIDE: Liquidity Ask Order Column Panel */}
      <div className="space-y-0.5">
        <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl mb-1.5 select-none border border-transparent ${
          isDark ? 'bg-red-500/5 text-red-400' : 'bg-red-50 text-red-700 font-bold border-red-100/50'
        }`}>
          <span className="text-xs uppercase font-black tracking-widest">Asks</span>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Qty</span>
        </div>
        
        {depth.asks.map((item) => (
          <AskDepthRow
            key={`ask-depth-price-${item.price}`}
            ask={item}
            maxQty={orderBookLiquidityTelemetry.maxAskQty}
            isDark={isDark}
          />
        ))}
      </div>

    </div>
  );
}