import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const VAULT_ACKNOWLEDGEMENT_KEY = 'sp_sebi_disclaimer_acknowledged';

/**
 * Immutable Registry of SEBI-Aligned Risk Manifestos
 */
const REGULATORY_RISK_DIRECTIVES = Object.freeze([
  'Trading in financial derivatives (F&O) and underlying cash equities carries a high level of capital risk and may result in partial or total equity loss.',
  'Historical analysis or algorithmic backtesting outputs do not establish an absolute predictive timeline for future market performance results.',
  'The embedded AI stream copilot evaluates live parametric datasets using local vector models but does not compile personalized asset recommendations.',
  'This platform functions strictly as an engineering data simulation sandbox and does not extend SEBI-registered corporate financial advisor licenses.',
  'Sandbox paper trading interfaces deploy mock currency structures. Real execution profiles route live order flows with systemic capital exposure risks.'
]);

/**
 * Standardized Compliance Point Item Row Component
 */
const RiskDirectiveRow = React.memo(({ directiveText, isDark }) => (
  <div className="flex items-start gap-3 select-none">
    <span className="text-amber-400 text-sm mt-0.5 leading-none">•</span>
    <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
      {directiveText}
    </p>
  </div>
));

RiskDirectiveRow.displayName = 'RiskDirectiveRow';

/**
 * Master Market Compliance Framework Guard & Risk Disclaimer Component
 */
export default function SEBIDisclaimer() {
  const { isDark } = useTheme();
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  // Storage Verification & Acknowledgment Pipelines
  useEffect(() => { 
    if (!localStorage.getItem(VAULT_ACKNOWLEDGEMENT_KEY)) {
      setIsOverlayVisible(true);
    }
  }, []);

  const handleAcknowledgeCompliance = useCallback(() => {
    localStorage.setItem(VAULT_ACKNOWLEDGEMENT_KEY, 'true');
    setIsOverlayVisible(false);
  }, []);

  if (!isOverlayVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Structural Risk Dialog Card */}
      <div 
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-scale-in transition-all duration-200 ${
          isDark ? 'bg-zinc-950 border-zinc-900 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}
      >
        {/* Compliance Card Title Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
          <div className="flex items-center gap-2.5 select-none">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
              Institutional Risk Disclosure
            </h2>
          </div>
          
          <button 
            onClick={handleAcknowledgeCompliance} 
            className={`p-1.5 rounded-xl border border-transparent transition-all duration-150 ${
              isDark ? 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
            }`}
            title="Acknowledge Directives"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Regulatory Disclosures Canvas Body Content */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          
          {/* Centralized Baseline Warning Banner */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border select-none ${
            isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/60 border-amber-200'
          }`}>
            <span className="text-[11px] font-bold tracking-wide uppercase text-amber-400">
              Securities market investments are exposed directly to system risks.
            </span>
          </div>
          
          <p className={`text-xs font-semibold leading-relaxed tracking-wide ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Please review standard configuration prospectus material thoroughly before deploying execution frameworks. The metrics mapping profiles distributed inside this terminal dashboard are compiled exclusively for educational, computational modeling applications.
          </p>
          
          {/* Render Vector Iteration Lists */}
          <div className="space-y-3 pt-1">
            {REGULATORY_RISK_DIRECTIVES.map((directive, idx) => (
              <RiskDirectiveRow
                key={`regulatory-rule-${idx}`}
                directiveText={directive}
                isDark={isDark}
              />
            ))}
          </div>
          
          {/* Official Mandated SEBI Quotation Footer Block */}
          <div className={`pt-3 border-t select-none ${isDark ? 'border-zinc-900' : 'border-slate-100'}`}>
            <p className={`text-[10px] font-medium leading-relaxed italic ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
              "Investments in securities market are subject to market risks, read all the scheme related documents carefully before investing." — Mandatory SEBI Statutory Framework Notation.
            </p>
          </div>
        </div>

        {/* Mandatory Action Execution Button Panel Footer */}
        <div className={`p-4 border-t select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/20'}`}>
          <button 
            onClick={handleAcknowledgeCompliance} 
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs uppercase font-bold tracking-wider rounded-xl shadow-md shadow-emerald-950/20 hover:brightness-105 transition-all duration-200"
          >
            Confirm Framework Acknowledgment
          </button>
        </div>

      </div>
    </div>
  );
}