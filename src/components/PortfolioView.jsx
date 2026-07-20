import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Briefcase, PieChart, Inbox } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized High-Frequency Analytics Card Widget Component
 */
const MetricSummaryCard = React.memo(({ label, value, subValue, valueClass = '', isDark, icon }) => (
  <div 
    className={`rounded-xl p-4 border shadow-sm select-none transition-all duration-150 ${
      isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200'
    }`}
  >
    <div className="flex items-center gap-2 mb-1.5">
      {icon}
      <p className="text-[11px] uppercase font-bold tracking-wider text-zinc-500">{label}</p>
    </div>
    <p className={`text-lg font-black font-mono tracking-tight ${valueClass || (isDark ? 'text-zinc-100' : 'text-slate-900')}`}>
      {value}
    </p>
    {subValue && (
      <p className={`text-xs font-mono font-bold mt-0.5 ${valueClass}`}>
        {subValue}
      </p>
    )}
  </div>
));

MetricSummaryCard.displayName = 'MetricSummaryCard';

/**
 * Standardized Portfolio Position Item Row Component
 */
const PortfolioHoldingRow = React.memo(({ position, onSelectStock, isDark }) => {
  const isPositiveYield = position.pnl >= 0;

  return (
    <tr 
      onClick={() => onSelectStock?.(position.symbol)} 
      className={`border-b cursor-pointer transition-colors duration-150 select-none ${
        isDark ? 'border-zinc-900 hover:bg-zinc-900/40' : 'border-slate-100 hover:bg-slate-50/80'
      }`}
    >
      <td className="py-3 px-5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border uppercase tracking-wider ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            {position.symbol.slice(0, 3)}
          </div>
          <div>
            <p className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              {position.symbol}
            </p>
            <p className="text-[10px] font-medium text-zinc-500 truncate max-w-[120px] hidden sm:block">
              {position.name}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-3 px-5 text-right hidden md:table-cell">
        <span className={`text-sm font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {position.quantity}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right hidden md:table-cell">
        <span className={`text-sm font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {fmtINR(position.avgPrice)}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right">
        <span className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
          {fmtINR(position.currentPrice)}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right hidden lg:table-cell">
        <span className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
          {fmtINR(position.marketValue)}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right">
        <div className={`text-sm font-mono font-bold ${isPositiveYield ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositiveYield ? '+' : ''}{fmtINR(position.pnl)}
          <div className="text-[10px] font-bold">
            ({isPositiveYield ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
          </div>
        </div>
      </td>
    </tr>
  );
});

PortfolioHoldingRow.displayName = 'PortfolioHoldingRow';

/**
 * Master Capital Ledger Allocation & Portfolio Analysis Subsystem Component
 */
export default function PortfolioView({ quotes, holdings = [], cashBalance, onSelectStock }) {
  const { isDark } = useTheme();

  // -------------------------------------------------------------------------
  // High-Performance Valuation Metrics Aggregator Pipeline
  // Memoizes computations to preserve thread integrity under real-time ticks
  // -------------------------------------------------------------------------
  const aggregatedPortfolioDataMatrix = useMemo(() => {
    let accruedMarketValueSum = 0;
    let accruedCostBasisSum = 0;

    const mappedPositions = holdings
      .filter((asset) => asset.quantity > 0)
      .map((asset) => {
        const liveAssetQuote = quotes?.get(asset.symbol);
        const currentSpotPrice = liveAssetQuote?.price ?? asset.avgPrice;
        
        const evaluationMarketValue = asset.quantity * currentSpotPrice;
        const evaluationCostBasis = asset.quantity * asset.avgPrice;
        const netCapitalGainLossDelta = evaluationMarketValue - evaluationCostBasis;
        
        const computedYieldPercentage = evaluationCostBasis > 0 
          ? (netCapitalGainLossDelta / evaluationCostBasis) * 100 
          : 0;

        accruedMarketValueSum += evaluationMarketValue;
        accruedCostBasisSum += evaluationCostBasis;

        return {
          ...asset,
          currentPrice: currentSpotPrice,
          marketValue: evaluationMarketValue,
          cost: evaluationCostBasis,
          pnl: netCapitalGainLossDelta,
          pnlPercent: computedYieldPercentage
        };
      })
      .sort((alpha, beta) => beta.marketValue - alpha.marketValue);

    const compositePortfolioNetWorth = accruedMarketValueSum + cashBalance;
    const compositeTotalCapitalDelta = accruedMarketValueSum - accruedCostBasisSum;
    const compositeDeltaPercentage = accruedCostBasisSum > 0 
      ? (compositeTotalCapitalDelta / accruedCostBasisSum) * 100 
      : 0;

    return {
      positions: mappedPositions,
      investedValue: accruedMarketValueSum,
      totalPortfolio: compositePortfolioNetWorth,
      totalPnl: compositeTotalCapitalDelta,
      totalPnlPercent: compositeDeltaPercentage
    };
  }, [holdings, quotes, cashBalance]);

  const cardContainerStyles = isDark ? 'bg-zinc-950/40 border-zinc-900' : 'bg-white border-slate-200';

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Structural Account Metrics Summary Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricSummaryCard label="Cash Available" value={fmtINR(cashBalance)} isDark={isDark} icon={<Wallet className="w-4 h-4 text-zinc-500" />} />
        <MetricSummaryCard label="Capital Invested" value={fmtINR(aggregatedPortfolioDataMatrix.investedValue)} isDark={isDark} icon={<Briefcase className="w-4 h-4 text-zinc-500" />} />
        <MetricSummaryCard label="Total Portfolio Value" value={fmtINR(aggregatedPortfolioDataMatrix.totalPortfolio)} isDark={isDark} icon={<PieChart className="w-4 h-4 text-zinc-500" />} />
        
        <MetricSummaryCard 
          label="Total Net Yield P&L" 
          value={`${aggregatedPortfolioDataMatrix.totalPnl >= 0 ? '+' : ''}${fmtINR(aggregatedPortfolioDataMatrix.totalPnl)}`} 
          subValue={`${aggregatedPortfolioDataMatrix.totalPnl >= 0 ? '+' : ''}${aggregatedPortfolioDataMatrix.totalPnlPercent.toFixed(2)}%`} 
          valueClass={aggregatedPortfolioDataMatrix.totalPnl >= 0 ? 'text-emerald-400 bg-emerald-500/5' : 'text-red-400 bg-red-500/5'} 
          isDark={isDark} 
          icon={aggregatedPortfolioDataMatrix.totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />} 
        />
      </div>

      {/* Primary Assets Inventory Table Container */}
      <div className={`rounded-2xl overflow-hidden border shadow-sm transition-all duration-200 ${cardContainerStyles}`}>
        
        <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-900' : 'border-slate-200'}`}>
          <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            Asset Inventory Holdings Allocations
          </h3>
        </div>

        {aggregatedPortfolioDataMatrix.positions.length === 0 ? (
          /* Empty Inventory State Fallback Panel View */
          <div className="py-20 flex flex-col items-center justify-center">
            <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-zinc-900/50 text-zinc-600' : 'bg-slate-50 text-slate-300'}`}>
              <Inbox className="w-6 h-6" />
            </div>
            <p className={`text-sm font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              No assets deployed in current sandbox
            </p>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              Navigate to the Market terminal grid view to execute your initial asset allocations.
            </p>
          </div>
        ) : (
          /* High-Frequency Data Matrix Presentation Frame Grid Table */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/20' : 'border-slate-200 bg-slate-50/60'}`}>
                  <th className={`text-left py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Asset Token</th>
                  <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden md:table-cell`}>Units Held</th>
                  <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden md:table-cell`}>Avg Purchase Cost</th>
                  <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>LTP (Spot)</th>
                  <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden lg:table-cell`}>Market Value</th>
                  <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Net Yield P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {aggregatedPortfolioDataMatrix.positions.map((item) => (
                  <PortfolioHoldingRow 
                    key={item.symbol} 
                    position={item} 
                    onSelectStock={onSelectStock} 
                    isDark={isDark} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}