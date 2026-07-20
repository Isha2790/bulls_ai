import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function SplashScreen({ onDone }) {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingProgressBarWidth, setLoadingProgressBarWidth] = useState(0);
  
  const totalExecutionGuardRef = useRef(false);

  // Orchestrated Staggered Pipeline Lifecycle
  // Registers timed macro queues defensively to safeguard application state mounts.

  useEffect(() => {
    if (totalExecutionGuardRef.current) return;

    const pipelineTimersRegistry = [
      setTimeout(() => setAnimationPhase(1), 600),
      setTimeout(() => setAnimationPhase(2), 1100),
      setTimeout(() => setAnimationPhase(3), 1700),
      setTimeout(() => setLoadingProgressBarWidth(100), 1750),
      setTimeout(() => setIsExiting(true), 2750),
      setTimeout(() => {
        if (totalExecutionGuardRef.current) return;
        totalExecutionGuardRef.current = true;
        if (typeof onDone === 'function') onDone();
      }, 3250),
    ];

    // Enforces a strict tracking cleanup mandate clearing outstanding macro states on unmount
    return () => {
      pipelineTimersRegistry.forEach((activeTimerId) => clearTimeout(activeTimerId));
    };
  }, [onDone]);

  return (
    <div 
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 select-none ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`} 
      style={{ background: 'linear-gradient(135deg, #070b12 0%, #0d1525 50%, #070b12 100%)' }}
    >
      {/* Structural Isometric Grid Pattern Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', 
          backgroundSize: '60px 60px' 
        }} 
      />
      
      {/* Hardware-Accelerated Ambient Light Blur Node */}
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[140px] bg-emerald-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Phase 0: Centralized Brand Icon Identity Mount */}
        <div 
          className={`transition-all cubic-bezier(0.34, 1.56, 0.64, 1) ${
            animationPhase >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`} 
          style={{ transitionDuration: '600ms' }}
        >
          <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl scale-150 animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/20 overflow-hidden">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
            </div>
        </div>

        {/* Phase 1: Rebranded Master Identity Ingestion Block */}
        <div 
          className={`mt-7 overflow-hidden transition-all ease-out ${
            animationPhase >= 1 ? 'opacity-100 translate-y-0 max-h-20' : 'opacity-0 translate-y-4 max-h-0'
          }`} 
          style={{ transitionDuration: '500ms' }}
        >
          <h1 className="text-5xl font-black text-white tracking-tight text-center">
            Bull's <span className="text-emerald-400">AI</span>
          </h1>
        </div>

        {/* Phase 2: Structural Meta Tags Subtitle Row */}
        <div 
          className={`mt-4 text-center transition-all ease-out ${
            animationPhase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`} 
          style={{ transitionDuration: '550ms' }}
        >
          <p className="text-zinc-400 text-sm font-semibold tracking-wide">
            High-Frequency Equities Analytics Platform
          </p>
          
          <div className="flex items-center justify-center flex-wrap gap-2.5 mt-4">
            {['NSE Metrics Basket', 'Unified RAG Engine', 'Vector Inference', 'Sandbox Operations'].map((tagLabel) => (
              <span 
                key={tagLabel} 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 select-none"
              >
                {tagLabel}
              </span>
            ))}
          </div>
        </div>

        {/* Phase 3: Linear Progress Verification Track Bar */}
        {animationPhase >= 3 && (
          <div className="mt-10 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/20">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full will-change-[width]" 
              style={{ 
                width: `${loadingProgressBarWidth}%`, 
                transition: 'width 1000ms cubic-bezier(0.22, 1, 0.36, 1)' 
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}