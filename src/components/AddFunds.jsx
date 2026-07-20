import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Wallet, Smartphone, CreditCard, Check, Loader2, Shield, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { fmtINR } from '../lib/marketEngine.js';

// Immutable Numeric Configuration Arrays
const PRESET_FUND_VALUES = Object.freeze([500, 1000, 5000, 10000, 25000, 50000]);
const SUPPORTED_UPI_APPS = Object.freeze(['GPay', 'PhonePe', 'Paytm', 'BHIM']);

/**
 * Master Wallet Balance Capital Deposit Subsystem Component
 */
export default function AddFunds({ isOpen, onClose, onSuccess, currentBalance }) {
  const { isDark } = useTheme();

  // Primary Form Input Control States
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card'
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [upiIdentifierInput, setUpiIdentifierInput] = useState('');
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardholderNameInput, setCardholderNameInput] = useState('');
  const [cardExpiryInput, setCardExpiryInput] = useState('');
  const [cardCvvInput, setCardCvvInput] = useState('');

  // Transaction Telemetry Pipeline States
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [isTransactionComplete, setIsTransactionComplete] = useState(false);
  const [formValidationErrorMessage, setFormValidationErrorMessage] = useState(null);

  // Defensive Asynchronous Cleanup Hook
  useEffect(() => {
    let transactionStageTimerId = null;
    let fallbackCloseTimerId = null;

    return () => {
      if (transactionStageTimerId) clearTimeout(transactionStageTimerId);
      if (fallbackCloseTimerId) clearTimeout(fallbackCloseTimerId);
    };
  }, []);

  // Computational Normalization Boundaries (Memoized)
  const parsedNumericAmount = useMemo(() => {
    const calculatedFloat = parseFloat(depositAmountInput);
    return isNaN(calculatedFloat) || calculatedFloat < 0 ? 0 : calculatedFloat;
  }, [depositAmountInput]);

  // -------------------------------------------------------------------------
  // Local Form Input Input Sanitization & Validation Gateways
  // -------------------------------------------------------------------------
  const executePaymentValidationGuard = useCallback(() => {
    setFormValidationErrorMessage(null);

    if (parsedNumericAmount <= 0) {
      setFormValidationErrorMessage('Transaction rejected: Enter a valid numerical funding amount.');
      return false;
    }

    if (paymentMethod === 'upi') {
      const upiStructureRegex = /^[\w.\-]{2,}@\w{2,}$/;
      if (!upiIdentifierInput.trim().match(upiStructureRegex)) {
        setFormValidationErrorMessage('Validation Error: Provide a proper address string handle (e.g., name@bank).');
        return false;
      }
    }

    if (paymentMethod === 'card') {
      const sanitizedCardStr = cardNumberInput.replace(/\s/g, '');
      if (sanitizedCardStr.length < 12 || isNaN(Number(sanitizedCardStr))) {
        setFormValidationErrorMessage('Validation Error: Card parameter format criteria mismatch.');
        return false;
      }
      if (!cardholderNameInput.trim()) {
        setFormValidationErrorMessage('Validation Error: Explicit cardholder signature name is required.');
        return false;
      }
      if (!cardExpiryInput.match(/^\d{2}\/\d{2}$/)) {
        setFormValidationErrorMessage('Validation Error: Expiry window criteria uses strictly MM/YY configuration.');
        return false;
      }
      if (cardCvvInput.length < 3 || isNaN(Number(cardCvvInput))) {
        setFormValidationErrorMessage('Validation Error: CVV verification token security string is incorrect.');
        return false;
      }
    }
    return true;
  }, [parsedNumericAmount, paymentMethod, upiIdentifierInput, cardNumberInput, cardholderNameInput, cardExpiryInput, cardCvvInput]);

  // Primary Gateway Order Submission Execution Route Callback
  const handlePaymentPipelineSubmission = useCallback(() => {
    if (!executePaymentValidationGuard()) return;

    setIsProcessingTransaction(true);

    // Initial mock latency buffer tracking bank gateway verification loops
    setTimeout(() => {
      setIsProcessingTransaction(false);
      setIsTransactionComplete(true);

      // Nested terminal transition delay caching callback executions safely
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess(parsedNumericAmount);
        }
        setIsTransactionComplete(false);
        
        // Form flush parameters reset array
        setDepositAmountInput('');
        setUpiIdentifierInput('');
        setCardNumberInput('');
        setCardholderNameInput('');
        setCardExpiryInput('');
        setCardCvvInput('');
        
        onClose?.();
      }, 1200);
    }, 1800);
  }, [executePaymentValidationGuard, parsedNumericAmount, onSuccess, onClose]);

  if (!isOpen) return null;

  // Visual Design Palette Token Mappings
  const modalWrapperStyles = isDark 
    ? 'bg-zinc-950 border-zinc-900 shadow-black/60' 
    : 'bg-white border-slate-200 shadow-slate-200/50';

  const dynamicFormInputThemeClasses = isDark
    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/10'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/10';

  const activeSelectorStyle = 'bg-emerald-500 text-white shadow-sm font-bold';
  const passiveSelectorStyle = isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-800';

  return (
    <>
      {/* Translucent Balance Veil Mask Overlay Layer */}
      <div 
        className="fixed inset-0 z-[150] bg-zinc-950/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Primary Settlement Canvas Dialogue Window Frame */}
      <div 
        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-full max-w-[440px] rounded-2xl shadow-2xl border overflow-hidden animate-scale-in transition-all duration-200 ${modalWrapperStyles}`}
      >
        {isTransactionComplete ? (
          /* CONDITION 1: Success Gateway Settlement Complete View Panel */
          <div className="p-10 text-center select-none animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-950/5">
              <Check className="w-8 h-8 text-emerald-400" strokeWidth={3} />
            </div>
            <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-zinc-50' : 'text-slate-900'}`}>
              Liquidity Allocation Stabilized
            </h3>
            <p className={`text-xs font-semibold mt-1.5 font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              {fmtINR(parsedNumericAmount)} appended cleanly down wallet nodes.
            </p>
          </div>
        ) : (
          /* CONDITION 2: Active Capital Input Entry Interactive State Form */
          <>
            {/* Modal Top Header Control Bar */}
            <div className={`flex items-center justify-between px-5 py-4 border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
              <div className="flex items-center gap-2.5">
                <Wallet className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Deploy Sandbox Liquidity
                </h3>
              </div>
              
              <button 
                onClick={onClose} 
                className={`p-1.5 rounded-xl border border-transparent transition-all duration-150 ${isDark ? 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Interactive Form Fields Body Container */}
            <div className="p-5 space-y-4">
              
              {/* Account Capital Balance Ledger Block */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border select-none ${
                isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-slate-50/80 border-slate-100'
              }`}>
                <span className="text-xs font-semibold text-zinc-500">Current Vault Liquidity</span>
                <span className={`text-sm font-mono font-bold ${isDark ? 'text-zinc-200' : 'text-slate-900'}`}>{fmtINR(currentBalance)}</span>
              </div>

              {/* Amount Unit Parameters Selection Fields Container */}
              <div>
                <label className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Target Volume Flow (₹)</label>
                <input type="number" value={depositAmountInput} onChange={(e) => setDepositAmountInput(e.target.value)} placeholder="5000" className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                
                {/* Numeric Presets Quick Vector Array Map Layout */}
                <div className="flex gap-1.5 mt-2.5 select-none">
                  {PRESET_FUND_VALUES.map((valueNode) => (
                    <button 
                      key={valueNode} 
                      onClick={() => setDepositAmountInput(String(valueNode))} 
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isDark 
                          ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {valueNode >= 1000 ? `${valueNode / 1000}K` : valueNode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods Route Segment Matrix Buttons Bar */}
              <div>
                <label className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Route Channel Gate</label>
                <div className={`flex gap-1 p-1 rounded-xl select-none ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
                  <button onClick={() => { setPaymentMethod('upi'); setFormValidationErrorMessage(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs uppercase transition-all duration-150 ${paymentMethod === 'upi' ? activeSelectorStyle : passiveSelectorStyle}`}>
                    <Smartphone className="w-3.5 h-3.5" /> UPI Channel
                  </button>
                  <button onClick={() => { setPaymentMethod('card'); setFormValidationErrorMessage(null); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs uppercase transition-all duration-150 ${paymentMethod === 'card' ? activeSelectorStyle : passiveSelectorStyle}`}>
                    <CreditCard className="w-3.5 h-3.5" /> Credit Grid
                  </button>
                </div>
              </div>

              {/* ROUTE NESTING A: UPI Address Inputs Grid */}
              {paymentMethod === 'upi' ? (
                <div className="animate-fade-in">
                  <label className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Virtual UPI Address Identifier</label>
                  <input type="text" value={upiIdentifierInput} onChange={(e) => setUpiIdentifierInput(e.target.value)} placeholder="account@bankname" className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                  
                  {/* Supported Branding Nodes Sub-Row Sheet */}
                  <div className="flex items-center gap-2 mt-2.5 select-none">
                    {SUPPORTED_UPI_APPS.map((appName) => (
                      <div key={appName} className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide border ${isDark ? 'bg-zinc-900/40 border-zinc-900 text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>{appName}</div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ROUTE NESTING B: Card Fields Input Sheet Layout */
                <div className="space-y-3 data-entry-card-block animate-fade-in">
                  <div>
                    <label className={`text-[11px] uppercase font-bold tracking-wider mb-1 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Inventory Card Number Signature</label>
                    <input type="text" value={cardNumberInput} onChange={(e) => setCardNumberInput(e.target.value)} maxLength="19" placeholder="4242 •••• •••• ••••" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                  </div>
                  <div>
                    <label className={`text-[11px] uppercase font-bold tracking-wider mb-1 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Authorized Cardholder Signature Name</label>
                    <input type="text" value={cardholderNameInput} onChange={(e) => setCardholderNameInput(e.target.value)} placeholder="e.g., ISHA DEV" className={`w-full rounded-xl px-4 py-2 text-sm border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                  </div>
                  
                  <div className="flex gap-2 select-none">
                    <div className="flex-1">
                      <label className={`text-[11px] uppercase font-bold tracking-wider mb-1 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Termination Expiry</label>
                      <input type="text" value={cardExpiryInput} onChange={(e) => setCardExpiryInput(e.target.value)} maxLength="5" placeholder="MM/YY" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                    </div>
                    <div className="w-24">
                      <label className={`text-[11px] uppercase font-bold tracking-wider mb-1 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>CVV Token</label>
                      <input type="password" value={cardCvvInput} onChange={(e) => setCardCvvInput(e.target.value)} maxLength="3" placeholder="•••" className={`w-full rounded-xl px-4 py-2 text-sm font-mono border focus:outline-none focus:ring-2 ${dynamicFormInputThemeClasses}`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Alert Messages Banner View */}
              {formValidationErrorMessage && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl border font-semibold font-mono animate-fade-in ${
                  isDark ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                  {formValidationErrorMessage}
                </div>
              )}

              {/* Security Prospectus Policy Banner */}
              <div className={`flex items-start gap-2.5 p-3 rounded-xl border select-none ${
                isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-200'
              }`}>
                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className={`text-[10px] font-medium leading-normal ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Transactions route through encrypted simulation vectors. System endpoints mirror standard 256-bit parsing environments; mock operational environments avoid charge liabilities.
                </p>
              </div>

              {/* Final Transaction Dispatch Submission Button */}
              <button 
                onClick={handlePaymentPipelineSubmission} 
                disabled={isProcessingTransaction || parsedNumericAmount <= 0} 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs uppercase font-bold tracking-wider shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50 btn-glow select-none"
              >
                {isProcessingTransaction ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Transmitting Vault Callbacks...</>
                ) : (
                  <>Authorize Deposit Allocation Flow {fmtINR(parsedNumericAmount)}</>
                )}
              </button>

            </div>
          </>
        )}
      </div>
    </>
  );
}