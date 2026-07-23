import React, { useState, useEffect, useCallback } from 'react';
import { signIn, signUp } from '../lib/database.js';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, X, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const NotificationToast = React.memo(({ type, message, onClose }) => {
  // ... (kept your existing toast — no change needed)
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

export default function AuthPage({ onAuth }) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
              {['Google', 'GitHub', 'Discord'].map((provider) => (
                <button key={provider} className="border border-zinc-800 hover:border-zinc-700 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
                  {provider}
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
            © 2026 Bull's AI • Isha Choudhary
          </p>
        </div>
      </div>
    </div>
  );
}