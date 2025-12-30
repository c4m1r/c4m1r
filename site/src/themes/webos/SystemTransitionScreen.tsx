import { useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';

type TransitionMode = 'logoff' | 'shutdown';

interface SystemTransitionScreenProps {
  mode: TransitionMode;
  onComplete: () => void;
  duration?: number;
}

const XP_MESSAGES: Record<TransitionMode, { title: string; subtitle: string }> = {
  logoff: {
    title: 'Logging off...',
    subtitle: 'Saving your settings',
  },
  shutdown: {
    title: 'Windows is shutting down...',
    subtitle: 'Saving your settings',
  },
};

const WIN98_MESSAGES: Record<TransitionMode, { title: string; subtitle: string }> = {
  logoff: {
    title: 'Please wait while Windows logs off...',
    subtitle: 'Saving your settings',
  },
  shutdown: {
    title: 'It is now safe to turn off your computer.',
    subtitle: '',
  },
};

export function SystemTransitionScreen({ mode, onComplete, duration }: SystemTransitionScreenProps) {
  const { theme } = useApp();
  const timeout = duration ?? (mode === 'shutdown' ? 3500 : 2200);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, timeout);
    return () => window.clearTimeout(timer);
  }, [onComplete, timeout]);

  const messages = useMemo(() => {
    if (theme === 'win-98') {
      return WIN98_MESSAGES[mode];
    }
    return XP_MESSAGES[mode];
  }, [theme, mode]);

  if (theme === 'win-98') {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center">
        <div className="w-[420px] bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,0.4)]">
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-3 py-2 mb-6 flex items-center justify-between">
            <span className="text-sm font-bold">Windows 98</span>
            <span className="text-xs">Microsoft Corporation</span>
          </div>
          <div className="bg-white border border-gray-400 px-4 py-8 text-center text-sm text-gray-800 shadow-inner">
            <p className="mb-3 font-semibold">{messages.title}</p>
            {messages.subtitle && <p>{messages.subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden theme-${theme} transition-opacity duration-500`}
      style={{
        background: 'radial-gradient(circle at 50% 40%, #5a7edc 0%, #0f3ea6 35%, #041a5c 100%)',
        animation: 'fadeIn 500ms ease-in-out',
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]" 
        style={{ 
          background: 'linear-gradient(to right, transparent 0%, #c3dafd 15% 50%, transparent 100%)'
        }} 
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px]" 
        style={{ 
          background: 'linear-gradient(to right, transparent 0%, #f99737 15% 50%, transparent 100%)'
        }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-4 text-white animate-pulse-subtle">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping-slow" />
          <div className="absolute inset-2 border-4 border-white rounded-full flex items-center justify-center bg-gradient-to-br from-white/20 to-transparent shadow-2xl backdrop-blur-sm">
            <div className="w-14 h-14 border-4 border-white/70 border-t-transparent rounded-full animate-spin" 
              style={{ animationDuration: '0.8s' }} 
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
          style={{ fontFamily: 'Franklin Gothic Medium, Arial, sans-serif' }}>
          {messages.title}
        </h1>
        {messages.subtitle && (
          <p className="text-base text-white/90 drop-shadow-lg animate-fade-in-delay">
            {messages.subtitle}
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes fade-in-delay {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 600ms ease-out forwards;
          animation-delay: 200ms;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

