import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTradingMode } from '../context/TradingModeContext.jsx';
import {
  Link2, X, Check, ShieldCheck, Smartphone, ArrowLeft, Loader2,
  Unlink, Lock, ChevronRight, AlertTriangle,
} from 'lucide-react';

const APP_NAME = 'TradeSim';
const GATEWAY_OAUTH_REDIRECT_URI =
  typeof window !== 'undefined' ? `${window.location.host}/auth/callback` : 'tradesim.app/auth/callback';

/**
 * Registry of supported broker "gateways". `domain` powers the simulated
 * address bar so the consent screen reads like a real handoff, and
 * `scopes` are the permissions shown on that screen.
 */
const SUPPORTED_BROKERS_REGISTRY = Object.freeze([
  { id: 'upstox', name: 'Upstox', color: '#5610c0', domain: 'login.upstox.com', desc: 'High-frequency streaming link' },
  { id: 'zerodha', name: 'Zerodha Kite', color: '#387ed1', domain: 'kite.zerodha.com', desc: "India's highest volume terminal" },
  { id: 'angelone', name: 'Angel One', color: '#e8533f', domain: 'smartapi.angelone.in', desc: 'Full-service enterprise endpoints' },
  { id: 'icici', name: 'ICICI Breeze', color: '#f37e20', domain: 'api.icicidirect.com', desc: 'Secure ICICI corporate channel' },
  { id: 'fyers', name: 'Fyers', color: '#0066ff', domain: 'api.fyers.in', desc: 'Modern charting execution link' },
  { id: 'dhan', name: 'Dhan', color: '#23c655', domain: 'login.dhan.co', desc: 'Advanced derivatives focus matrix' },
]);

const SCOPES = [
  'View your holdings, positions and funds',
  'Place, modify and cancel orders on your behalf',
  'Read live market quotes',
];

// A couple of plausible Google accounts for the simulated chooser
const MOCK_GOOGLE_ACCOUNTS = [
  { name: 'Demo User', email: 'demo.user@example.com', initial: 'D', color: '#4285F4' },
  { name: 'Trading Demo', email: 'trading.demo@example.com', initial: 'T', color: '#EA4335' },
];

export default function BrokerConnect({ isOpen, onClose }) {
  const { isDark } = useTheme();
  const { brokerConnected, brokerName, connectBroker, disconnectBroker } = useTradingMode();

  
  const [workflowStep, setWorkflowStep] = useState('select');
  const [activeBroker, setActiveBroker] = useState(null);

  // Sub-stage inside the simulated broker portal
  // 'consent' | 'google-chooser' | 'phone-number' | 'phone-otp'
  const [portalStage, setPortalStage] = useState('consent');
  const [isBusy, setIsBusy] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const connectedBrokerDetails = useMemo(() => {
    return SUPPORTED_BROKERS_REGISTRY.find((b) => b.name === brokerName) || {
      name: brokerName,
      color: '#10b981',
    };
  }, [brokerName]);

  const resetWorkflow = useCallback(() => {
    setWorkflowStep('select');
    setActiveBroker(null);
    setPortalStage('consent');
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
    setIsBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    resetWorkflow();
    onClose?.();
  }, [resetWorkflow, onClose]);

  const handleSelectBroker = useCallback((broker) => {
    setActiveBroker(broker);
    setPortalStage('consent');
    setWorkflowStep('portal');
  }, []);

  // Final step for every auth path: show a brief "redirecting back to
  // TradeSim" beat, then hand off to the trading-mode context.
  const finishAuthorization = useCallback((label) => {
    setIsBusy(false);
    setWorkflowStep('redirecting');
    setTimeout(() => {
      connectBroker(label);
    }, 1400);
  }, [connectBroker]);

  const handleGoogleAccountPick = useCallback((account) => {
    setIsBusy(true);
    setTimeout(() => {
      finishAuthorization(`${activeBroker?.name} (Google · ${account.email})`);
    }, 1100);
  }, [activeBroker, finishAuthorization]);

  const handleSendOTP = useCallback((e) => {
    e.preventDefault();
    setIsBusy(true);
    setTimeout(() => {
      setIsBusy(false);
      setOtpSent(true);
      setPortalStage('phone-otp');
    }, 1000);
  }, []);

  const handleVerifyOTP = useCallback((e) => {
    e.preventDefault();
    setIsBusy(true);
    setTimeout(() => {
      finishAuthorization(`${activeBroker?.name} (Mobile · ${phoneNumber.slice(-4).padStart(10, '•')})`);
    }, 1000);
  }, [activeBroker, phoneNumber, finishAuthorization]);

  const handleDisconnect = useCallback(() => {
    disconnectBroker();
    resetWorkflow();
    onClose?.();
  }, [disconnectBroker, resetWorkflow, onClose]);

  if (!isOpen) return null;

  const cardThemeStyles = isDark
    ? 'bg-zinc-950 border-zinc-900 shadow-black/60'
    : 'bg-white border-slate-200 shadow-slate-200/50';

  const inputThemeStyles = isDark
    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/10'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/10';

  const fakeAuthorizeUrl = activeBroker
    ? `https://${activeBroker.domain}/oauth/authorize?client_id=${APP_NAME.toLowerCase()}&redirect_uri=${GATEWAY_OAUTH_REDIRECT_URI}`
    : '';

  return (
    <>
      <div className="fixed inset-0 z-[130] bg-zinc-950/60 backdrop-blur-md animate-fade-in" onClick={handleClose} />

      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[140] w-full max-w-[440px] rounded-2xl shadow-2xl border overflow-hidden animate-scale-in transition-all duration-200 ${cardThemeStyles}`}>

        {/*  CONNECTED STATE */}
        {brokerConnected ? (
          <>
            <div className={`flex items-center justify-between px-5 py-4 border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-emerald-400" />
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Active Connection</h3>
              </div>
              <button onClick={handleClose} className={`p-1.5 rounded-xl border border-transparent transition-all duration-150 ${isDark ? 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border select-none ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/60 border-emerald-100'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white text-sm font-black" style={{ backgroundColor: connectedBrokerDetails.color }}>
                  {connectedBrokerDetails.name[0]}
                </div>
                <div>
                  <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{connectedBrokerDetails.name}</p>
                  <p className="text-xs font-bold text-emerald-400 tracking-wide uppercase mt-0.5">Authorized · Live</p>
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-start gap-2.5 border select-none ${isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50/60 border-amber-100'}`}>
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] font-medium text-amber-400 leading-normal">
                  Routing orders through a live broker session bypasses paper-trading protections. Double-check position sizing before you trade.
                </p>
              </div>

              <button onClick={handleDisconnect} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider transition-all hover:bg-red-500/10 select-none">
                <Unlink className="w-4 h-4" /> Disconnect
              </button>
            </div>
          </>

        /* STEP 1: PICK A BROKER */
        ) : workflowStep === 'select' ? (
          <>
            <div className={`flex items-center justify-between px-5 py-4 border-b select-none ${isDark ? 'border-zinc-900 bg-zinc-900/10' : 'border-slate-100 bg-slate-50/40'}`}>
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-emerald-400" />
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Link Trading Broker</h3>
              </div>
              <button onClick={handleClose} className={`p-1.5 rounded-xl border border-transparent transition-all duration-150 ${isDark ? 'hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className={`text-xs font-semibold tracking-wide select-none ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Choose your broker. You'll sign in on their site — {APP_NAME} never sees your password.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_BROKERS_REGISTRY.map((broker) => (
                  <button
                    key={broker.id}
                    onClick={() => handleSelectBroker(broker)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.015] ${isDark ? 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-800' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0" style={{ backgroundColor: broker.color }}>
                      {broker.name[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-xs font-bold tracking-tight truncate ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{broker.name}</p>
                      <p className="text-[9px] font-medium text-zinc-500 truncate max-w-[125px]">{broker.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>

        /* STEP 2: REDIRECTING BACK */
        ) : workflowStep === 'redirecting' ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-4 select-none">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: activeBroker?.color }}>
              <Check className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Authorized by {activeBroker?.name}</p>
              <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Redirecting you back to {GATEWAY_OAUTH_REDIRECT_URI}…
              </p>
            </div>
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          </div>

         /*STEP 3: SIMULATED BROKER PORTAL */
        ) : (
          <>
            {/* Fake browser chrome so this reads as "you left our site" */}
            <div className={`px-4 py-2.5 border-b flex items-center gap-2 select-none ${isDark ? 'bg-zinc-900/60 border-zinc-900' : 'bg-slate-100 border-slate-200'}`}>
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className={`flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono truncate ${isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-white text-slate-500'}`}>
                <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{fakeAuthorizeUrl}</span>
              </div>
            </div>

            <div className={`flex items-center justify-between px-5 py-3 border-b select-none ${isDark ? 'border-zinc-900' : 'border-slate-100'}`}>
              <button
                onClick={() => (portalStage === 'consent' ? setWorkflowStep('select') : setPortalStage('consent'))}
                className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button onClick={handleClose} className={`p-1 rounded-lg ${isDark ? 'text-zinc-600 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-700'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {portalStage === 'consent' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex flex-col items-center text-center gap-3 select-none">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-black shadow-md" style={{ backgroundColor: activeBroker?.color }}>
                      {activeBroker?.name[0]}
                    </div>
                    <div>
                      <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{activeBroker?.name} account access</p>
                      <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                        <span className="font-bold">{APP_NAME}</span> wants to connect to your {activeBroker?.name} account
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 select-none">
                    {SCOPES.map((scope) => (
                      <li key={scope} className={`flex items-start gap-2 text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        {scope}
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setPortalStage('google-chooser')}
                      className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all ${isDark ? 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-100' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'}`}
                    >
                      <GoogleGlyph />
                      Continue with Google
                    </button>
                    <button
                      onClick={() => setPortalStage('phone-number')}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    >
                      <Smartphone className="w-4 h-4" /> Continue with phone number
                    </button>
                  </div>

                  <p className={`flex items-center justify-center gap-1.5 text-[10px] font-medium select-none ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" /> Your {activeBroker?.name} password is never shared with {APP_NAME}
                  </p>
                </div>
              )}

              {portalStage === 'google-chooser' && (
                <div className="space-y-4 animate-fade-in select-none">
                  <div className="text-center">
                    <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Choose an account</p>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>to continue to {activeBroker?.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_GOOGLE_ACCOUNTS.map((acct) => (
                      <button
                        key={acct.email}
                        disabled={isBusy}
                        onClick={() => handleGoogleAccountPick(acct)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all disabled:opacity-50 ${isDark ? 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800' : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: acct.color }}>
                          {acct.initial}
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className={`text-xs font-bold truncate ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>{acct.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{acct.email}</p>
                        </div>
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin ml-auto text-emerald-400 shrink-0" /> : <ChevronRight className="w-4 h-4 ml-auto text-zinc-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {portalStage === 'phone-number' && (
                <form onSubmit={handleSendOTP} className="space-y-4 animate-fade-in select-none">
                  <div className="text-center">
                    <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Verify your mobile number</p>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Registered with {activeBroker?.name}</p>
                  </div>
                  <div>
                    <label className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 block ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Mobile number</label>
                    <input
                      type="tel" required value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10 digit number" maxLength="10"
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono border focus:outline-none focus:ring-2 ${inputThemeStyles}`}
                    />
                  </div>
                  <button
                    type="submit" disabled={phoneNumber.length < 10 || isBusy}
                    className="w-full text-white text-xs uppercase font-bold tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40"
                    style={{ backgroundColor: activeBroker?.color }}
                  >
                    {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send OTP
                  </button>
                </form>
              )}

              {portalStage === 'phone-otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in select-none">
                  <div className="text-center">
                    <p className={`text-sm font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>Enter the OTP</p>
                    <p className={`text-xs font-medium mt-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Sent to +91 {phoneNumber.slice(0, 2)}••••{phoneNumber.slice(-2)}</p>
                  </div>
                  <input
                    type="text" required value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••" maxLength="6"
                    className={`w-full text-center tracking-[0.5em] rounded-xl px-4 py-2.5 text-base font-mono border focus:outline-none focus:ring-2 ${inputThemeStyles}`}
                  />
                  <button
                    type="submit" disabled={otpCode.length < 6 || isBusy}
                    className="w-full text-white text-xs uppercase font-bold tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-40"
                    style={{ backgroundColor: activeBroker?.color }}
                  >
                    {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Verify & authorize
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
function GoogleGlyph() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.87 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.98v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.71A5.4 5.4 0 0 1 3.67 9c0-.6.1-1.18.28-1.71V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.97-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.96l2.97 2.33C4.66 5.16 6.65 3.58 9 3.58z" />
    </svg>
  );
}