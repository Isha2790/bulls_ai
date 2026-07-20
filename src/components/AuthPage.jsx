import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { signIn, signUp } from '../lib/database.js';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * Standardized High-Performance Feedback Notification Toast
 * Enforces strict self-termination cleanup mandates on component unmount
 */
const NotificationToast = React.memo(({ type, message, onClose }) => {
  useEffect(() => {
    const macroSelfDestructTimerId = setTimeout(() => {
      if (typeof onClose === 'function') onClose();
    }, 4500);

    return () => clearTimeout(macroSelfDestructTimerId);
  }, [onClose]);

  // Design tokens maps tracking dynamic alert contexts
  const styleVariantsMatrix = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-950/20',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/20',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-950/20'
  };

  const StatusIconComponent = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div 
      className={`fixed top-5 right-5 z-[300] flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in-right select-none ${
        styleVariantsMatrix[type] || styleVariantsMatrix.info
      }`} 
      style={{ maxWidth: 360 }}
    >
      <StatusIconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-xs font-semibold leading-relaxed flex-1">{message}</p>
      
      <button 
        onClick={onClose}
        className="p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity outline-none"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

NotificationToast.displayName = 'NotificationToast';

/**
 * Master Enterprise Authentication Terminal Control Panel
 */
export default function AuthPage({ onAuth }) {
  const { isDark } = useTheme();
  
  // Primary Form Interaction Controls States
  const [accessWorkflowMode, setAccessWorkflowMode] = useState('signin'); // 'signin' | 'signup'
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPasswordInput, setUserPasswordInput] = useState('');
  
  // Pipeline Workflow Telemetry States
  const [isSubmissionActive, setIsSubmissionActive] = useState(false);
  const [activeToastTelemetry, setActiveToastTelemetry] = useState(null);
  const [formValidationErrors, setFormValidationErrors] = useState({});
  const [isInterfaceVisible, setIsInterfaceVisible] = useState(false);

  // Smooth Interface Mounting Fade-In Effect Hook
  useEffect(() => {
    const visualMountTimerId = setTimeout(() => setIsInterfaceVisible(true), 50);
    return () => clearTimeout(visualMountTimerId);
  }, []);

  // Defensive Validation Layer Blueprint
  const executeFormValidationGuard = useCallback(() => {
    const compiledErrorManifest = {};
    
    if (!userEmailInput.includes('@')) {
      compiledErrorManifest.email = 'Authentication error: Provide a valid email reference.';
    }
    
    if (userPasswordInput.length < 6) {
      compiledErrorManifest.password = 'Authentication error: Password criteria requires min 6 character tokens.';
    }

    setFormValidationErrors(compiledErrorManifest);
    return Object.keys(compiledErrorManifest).length === 0;
  }, [userEmailInput, userPasswordInput]);

  // Primary Submit Form Submission Action Route Callback
  const handleFormSubmissionPipeline = useCallback(async (formEvent) => {
    formEvent.preventDefault();
    setActiveToastTelemetry(null);

    if (!executeFormValidationGuard()) return;
    setIsSubmissionActive(true);
    
    try {
      if (accessWorkflowMode === 'signup') {
        const structuralOperationResult = await signUp(userEmailInput, userPasswordInput);
        
        if (structuralOperationResult?.error) {
          if (structuralOperationResult.error.includes('already')) {
            setActiveToastTelemetry({ 
              type: 'info', 
              message: 'Account index localized: Identity registered previously. Swapping execution profile to Sign-In mode.' 
            });
            setAccessWorkflowMode('signin');
          } else {
            setActiveToastTelemetry({ type: 'error', message: structuralOperationResult.error });
          }
        } else {
          setActiveToastTelemetry({ type: 'success', message: 'Corporate profile initialized successfully!' });
          setTimeout(() => {
            if (typeof onAuth === 'function') onAuth();
          }, 600);
        }
      } else {
        const structuralOperationResult = await signIn(userEmailInput, userPasswordInput);
        
        if (structuralOperationResult?.error) {
          setActiveToastTelemetry({ type: 'error', message: structuralOperationResult.error });
          setFormValidationErrors({ password: 'Login validation rejected: Credential parameters match failure.' });
        } else {
          if (typeof onAuth === 'function') onAuth();
        }
      }
    } catch (unexpectedExceptionError) {
      setActiveToastTelemetry({ 
        type: 'error', 
        message: 'System connectivity exception error detected. Review service parameters logs.' 
      });
    } finally {
      setIsSubmissionActive(false);
    }
  }, [accessWorkflowMode, userEmailInput, userPasswordInput, executeFormValidationGuard, onAuth]);

  // Design Token Visual Mapping Clones
  const inputClassThemeBlueprint = isDark 
    ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 placeholder-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/10' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400 focus:ring-emerald-400/10';

  const layoutThemeWrapperClass = isDark 
    ? 'bg-zinc-950' 
    : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200';

  const dismissToast = useCallback(() => {
    setActiveToastTelemetry(null);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${layoutThemeWrapperClass}`}>
      
      {/* Target Active Alert Warning System View Toast */}
      {activeToastTelemetry && (
        <NotificationToast 
          {...activeToastTelemetry} 
          onClose={dismissToast} 
        />
      )}
      
      {/* Engineering Blueprint Background Overlay Mesh */}
      <div 
        className="absolute inset-0 pointer-events-none select-none" 
        style={{ 
          backgroundImage: isDark 
            ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)' 
            : 'linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)', 
          backgroundSize: '56px 56px' 
        }} 
      />
      
      {/* High-Performance Fluid Ambient Blur Vector Glow Sphere */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[150px] bg-emerald-500 pointer-events-none will-change-transform" />
      
      {/* Core Dynamic Content Positioning Frame Box */}
      <div 
        className={`ease-[cubic-bezier(0.16,1,0.3,1)] duration-700 ${
          isInterfaceVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div 
          className={`rounded-2xl p-7 shadow-2xl border transition-all duration-200 ${
            isDark ? 'bg-zinc-950/40 border-zinc-900 shadow-black/50 backdrop-blur-md' : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}
        >
          {/* Sign-In / Create Account Flow Split Action Sliders Tab Bar */}
          <div className={`flex gap-1 p-1 rounded-xl mb-6 select-none ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
            {['signin', 'signup'].map((segmentModeKey) => (
              <button 
                key={segmentModeKey} 
                onClick={() => { 
                  setAccessWorkflowMode(segmentModeKey); 
                  setFormValidationErrors({}); 
                  setActiveToastTelemetry(null); 
                }} 
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  accessWorkflowMode === segmentModeKey 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                    : isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {segmentModeKey === 'signin' ? 'Sign In' : 'Create Profile'}
              </button>
            ))}
          </div>

          {/* Core Access Input Fields Actions Terminal Container Form */}
          <form onSubmit={handleFormSubmissionPipeline} className="space-y-4">
            
            {/* Input Element 1: Email Lane Layout Address */}
            <div>
              <label className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Email Account Address
              </label>
              
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-700' : 'text-slate-400'}`} />
                <input 
                  type="email" 
                  value={userEmailInput} 
                  onChange={(e) => { 
                    setUserEmailInput(e.target.value); 
                    setFormValidationErrors((prev) => ({ ...prev, email: null })); 
                  }} 
                  required 
                  placeholder="name@gmail.com" 
                  className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm border focus:outline-none focus:ring-2 ${
                    formValidationErrors.email ? 'border-red-500/50 ring-2 ring-red-500/10' : ''
                  } ${inputClassThemeBlueprint}`} 
                />
              </div>
              {formValidationErrors.email && (
                <p className="mt-1.5 text-[11px] font-mono font-bold text-red-400 animate-fade-in">{formValidationErrors.email}</p>
              )}
            </div>

            {/* Input Element 2: Password Access Control Lock */}
            <div>
              <label className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 block select-none ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                Account Password
              </label>
              
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-700' : 'text-slate-400'}`} />
                <input 
                  type="password" 
                  value={userPasswordInput} 
                  onChange={(e) => { 
                    setUserPasswordInput(e.target.value); 
                    setFormValidationErrors((prev) => ({ ...prev, password: null })); 
                  }} 
                  required 
                  minLength={6} 
                  placeholder="••••••••••••" 
                  className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm font-mono border focus:outline-none focus:ring-2 ${
                    formValidationErrors.password ? 'border-red-500/50 ring-2 ring-red-500/10' : ''
                  } ${inputClassThemeBlueprint}`} 
                />
              </div>
              {formValidationErrors.password && (
                <p className="mt-1.5 text-[11px] font-mono font-bold text-red-400 animate-fade-in">{formValidationErrors.password}</p>
              )}
            </div>

            {/* Main Primary Workflow Transmission Authorization Button Trigger */}
            <button 
              type="submit" 
              disabled={isSubmissionActive} 
              className="btn-glow w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs uppercase font-bold tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 group disabled:opacity-60 shadow-md shadow-emerald-950/20 transition-all select-none mt-2"
            >
              {isSubmissionActive ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {accessWorkflowMode === 'signin' ? 'Verify Entry Sign In' : 'Authorize Account Registration'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}