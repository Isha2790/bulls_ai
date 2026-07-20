import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Inbox } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

/**
 * Standardized Reusable Transaction Ledger Row Component
 * Optimized to encapsulate layout boundaries and isolate rendering calculations.
 */
const TradeHistoryRow = React.memo(({ trade, onSelectStock, isDark }) => {
  // Pre-computes localized timestamps defensively inside an isolated row lifecycle
  const formattedTimestampStr = useMemo(() => {
    if (!trade.createdAt) return '—';
    return new Date(trade.createdAt).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [trade.createdAt]);

  const isBuySide = trade.side === 'BUY';
  const isDeposit = trade.side === 'DEPOSIT';

  // Resolves layout style classifications dynamically matching item directional trends
  const sideBadgeStyles = isBuySide
    ? 'bg-emerald-500/10 text-emerald-400'
    : isDeposit
    ? 'bg-blue-500/10 text-blue-400'
    : 'bg-red-500/10 text-red-400';

  return (
    <tr 
      onClick={() => trade.symbol !== 'FUNDS' && onSelectStock?.(trade.symbol)} 
      className={`border-b transition-colors duration-150 select-none ${
        trade.symbol !== 'FUNDS' ? 'cursor-pointer' : 'cursor-default'
      } ${
        isDark 
          ? 'border-zinc-900 hover:bg-zinc-900/40' 
          : 'border-slate-100 hover:bg-slate-50/80'
      }`}
    >
      <td className="py-3 px-5">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${sideBadgeStyles}`}>
          {isBuySide ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {trade.side}
        </div>
      </td>
      
      <td className="py-3 px-5">
        <div className="flex flex-col">
          <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
            {trade.symbol}
          </span>
          <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px] hidden sm:block">
            {trade.name}
          </span>
        </div>
      </td>
      
      <td className="py-3 px-5 text-right hidden md:table-cell">
        <span className={`text-sm font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {trade.quantity}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right hidden md:table-cell">
        <span className={`text-sm font-mono font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          {fmtINR(trade.price)}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right">
        <span className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
          {fmtINR(trade.total)}
        </span>
      </td>
      
      <td className="py-3 px-5 text-right hidden lg:table-cell">
        <span className={`text-xs font-medium font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
          {formattedTimestampStr}
        </span>
      </td>
    </tr>
  );
});

TradeHistoryRow.displayName = 'TradeHistoryRow';

/**
 * Master Audited Order Ledger Board Panel Component
 */
export default function TradeHistory({ trades = [], onSelectStock }) {
  const { isDark } = useTheme();

  return (
    <div 
      className={`rounded-2xl overflow-hidden border transition-all duration-200 shadow-sm ${
        isDark 
          ? 'bg-zinc-950/40 border-zinc-900' 
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Table Section Title Bar */}
      <div className={`px-5 py-4 border-b ${isDark ? 'border-zinc-900' : 'border-slate-200'}`}>
        <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
          Order Execution History
        </h3>
      </div>

      {trades.length === 0 ? (
        /* Empty State Fallback View Panel */
        <div className="py-20 flex flex-col items-center justify-center transition-fade">
          <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-zinc-900/50 text-zinc-600' : 'bg-slate-50 text-slate-300'}`}>
            <Inbox className="w-6 h-6" />
          </div>
          <p className={`text-sm font-bold ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            No transactions registered yet
          </p>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
            Your systematic buy and sell order executions will record here.
          </p>
        </div>
      ) : (
        /* Data Layout Frame Matrix Grid */
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr 
                className={`border-b select-none ${
                  isDark 
                    ? 'border-zinc-900 bg-zinc-900/20' 
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <th className={`text-left py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Type</th>
                <th className={`text-left py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Asset Token</th>
                <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden md:table-cell`}>Units</th>
                <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden md:table-cell`}>Execution Valuation</th>
                <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Total Flow</th>
                <th className={`text-right py-3 px-5 text-xs uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-400'} hidden lg:table-cell`}>Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {trades.map((item) => (
                <TradeHistoryRow
                  key={item.id}
                  trade={item}
                  onSelectStock={onSelectStock}
                  isDark={isDark}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}