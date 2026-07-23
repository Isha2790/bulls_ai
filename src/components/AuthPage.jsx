import React, { useState, useEffect, useCallback } from 'react';
import { signIn, signUp, signInWithOAuth } from '../lib/database.js';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, X, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
 
const NotificationToast = React.memo(({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 4500);
    return () => clearTimeout(timer);
  }, [onClose]);
 
  const styleVariants = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
  };
 
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
 
  return (
    <div className={`fixed top-5 right-5 z-[300] flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${styleVariants[type] || styleVariants.info}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-current/70 hover:text-current">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});
 
// lucide-react deliberately doesn't ship trademarked brand logos (Google, GitHub, Discord),
// so these are small inline SVGs using each brand's real mark/colors instead of plain text.
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.27-2.09 3.55-5.17 3.55-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.01c-1.08.72-2.46 1.15-4.04 1.15-3.11 0-5.74-2.1-6.68-4.92H1.3v3.1C3.27 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.32 14.32c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.66H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.34l4.02-3.02z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.66l4.02 3.02c.94-2.82 3.57-4.93 6.68-4.93z" />
  </svg>
);
 
const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
 
const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.45.86-.61 1.25a18.3 18.3 0 00-5.49 0 12.6 12.6 0 00-.63-1.25.08.08 0 00-.08-.04c-1.7.3-3.36.8-4.89 1.52a.07.07 0 00-.03.03C.53 9.1-.32 13.68.1 18.21a.08.08 0 00.03.06 19.9 19.9 0 006.01 3.04.08.08 0 00.08-.03c.46-.63.88-1.3 1.24-2a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.9.08.08 0 01-.01-.13c.13-.09.25-.19.37-.28a.07.07 0 01.08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 01.08.01c.12.1.24.19.37.28a.08.08 0 010 .13c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.11c.36.7.79 1.37 1.24 2a.08.08 0 00.08.03 19.8 19.8 0 006.02-3.04.08.08 0 00.03-.06c.5-5.24-.84-9.78-3.55-13.81a.06.06 0 00-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.16-1.09-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z" />
  </svg>
);
 
const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'github', label: 'GitHub', Icon: GitHubIcon },
  { id: 'discord', label: 'Discord', Icon: DiscordIcon },
];
 
export default function AuthPage({ onAuth }) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
 
  const validate = () => {
    const errs = {};
    if (!email.includes('@')) errs.email = 'Please enter a valid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
 
    setIsLoading(true);
    setToast(null);
 
    try {
      const result = mode === 'signup' 
        ? await signUp(email, password)
        : await signIn(email, password);
 
      if (result?.error) {
        setToast({ type: 'error', message: result.error });
        if (result.error.includes('already')) setMode('signin');
      } else {
        setToast({ type: 'success', message: mode === 'signup' ? 'Account created successfully!' : 'Welcome back!' });
        setTimeout(() => onAuth?.(), 800);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleOAuthClick = useCallback(async (providerId) => {
    setOauthLoadingProvider(providerId);
    setToast(null);
    try {
      const result = await signInWithOAuth(providerId);
      // On success, Supabase redirects the whole page to the provider's login screen,
      // so code after this line normally won't run - this only fires on an early failure
      // (e.g. that provider isn't enabled yet in the Supabase dashboard).
      if (result?.error) {
        setToast({ type: 'error', message: result.error });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: `${providerId[0].toUpperCase()}${providerId.slice(1)} sign-in isn't set up yet - enable it under Supabase → Authentication → Providers.`,
      });
    } finally {
      setOauthLoadingProvider(null);
    }
  }, []);
 
  const inputClasses = `w-full bg-zinc-900/70 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-zinc-500 ${isDark ? '' : 'bg-white border-slate-200 text-slate-900'}`;
 
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden ${isDark ? '' : 'bg-slate-50'}`}>
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,rgba(16,185,129,0.08),transparent)]" />
      
      {toast && <NotificationToast {...toast} onClose={() => setToast(null)} />}
 
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bull's AI</h1>
          <p className="text-zinc-400 mt-1 text-center">High-frequency equities analytics</p>
        </div>
 
        {/* Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white">
              {mode === 'signin' ? 'Sign in to your dashboard' : 'Create your trading profile'}
            </h2>
          </div>
 
          {/* Mode Tabs */}
          <div className="flex bg-zinc-800 rounded-2xl p-1 mb-8">
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === m 
                  ? 'bg-emerald-500 text-white shadow' 
                  : 'text-zinc-400 hover:text-white'}`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-1.5">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: null})); }}
                  className={inputClasses}
                  placeholder="admin@bulls.ai"
                  required
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
 
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 block mb-1.5">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: null})); }}
                  className={inputClasses}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
 
            {/* Extra controls (screenshot style) */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-emerald-500" /> Remember me
              </label>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 text-sm">Forgot password?</a>
            </div>
 
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.985] shadow-lg shadow-emerald-500/30 disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
 
          {/* Social login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-zinc-500">
                <span className="bg-zinc-900 px-4">or continue with</span>
              </div>
            </div>
 
            <div className="grid grid-cols-3 gap-3 mt-6">
              {OAUTH_PROVIDERS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleOAuthClick(id)}
                  disabled={oauthLoadingProvider !== null}
                  className="border border-zinc-800 hover:border-zinc-700 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {oauthLoadingProvider === id ? (
                    <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon />
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
 
          {/* Demo Credentials Box - For Recruiters */}
          <div className="mt-8 p-4 bg-zinc-950/80 border border-emerald-900/50 rounded-2xl">
            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold mb-2 text-center">Demo Credentials</p>
            <div className="text-center text-sm font-mono text-zinc-300">
              <p><span className="text-zinc-500">Email:</span> <span className="text-emerald-400">admin@bulls.ai</span></p>
              <p><span className="text-zinc-500">Password:</span> <span className="text-emerald-400">admin123</span></p>
            </div>
          </div>
 
          {/* Footer */}
          <p className="text-center text-sm text-zinc-400 mt-8 font-medium tracking-wide">
            © 2026 Bull's AI Admin • Isha Choudhary
          </p>
        </div>
      </div>
    </div>
  );
}