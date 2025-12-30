import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { User, Power } from 'lucide-react';
import userAvatar from '../winxp/assets/user.gif';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, theme, setMode } = useApp();
  const t = translations[language].xp;

  if (theme === 'win-98') {
    return (
      <div className="min-h-screen bg-[#008080] flex items-center justify-center font-sans">
        <div className="w-96 bg-[#c0c0c0] border-2 border-white border-b-black border-r-black p-1 shadow-xl">
          <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center mb-4">
            <span className="text-white font-bold text-sm">Welcome to Windows</span>
            <button className="w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold leading-none">
              ✕
            </button>
          </div>

          <div className="flex gap-4 px-4 pb-4">
            <div className="w-16">
              <div className="w-12 h-12 mx-auto mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-4 text-sm">Type a user name and password to log on to Windows.</p>

              <div className="grid grid-cols-[80px_1fr] gap-2 items-center mb-2">
                <label className="text-sm">User name:</label>
                <input type="text" value="C4m1r" readOnly className="border-2 border-gray-400 border-b-white border-r-white px-1 text-sm" />

                <label className="text-sm">Password:</label>
                <input type="password" className="border-2 border-gray-400 border-b-white border-r-white px-1 text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-4 pb-2">
            <button
              onClick={onLogin}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white focus:outline-dashed focus:outline-1"
            >
              OK
            </button>
            <button className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white">
              Cancel
            </button>
            <button
              onClick={() => setMode('grub')}
              className="px-6 py-1 border-2 border-white border-b-black border-r-black active:border-black active:border-b-white active:border-r-white"
            >
              Shut Down
            </button>
          </div>
        </div>
      </div>
    );
  }

  // XP Login Screen based on winOS-master WelcomeScreen.tsx and Content.tsx
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUserClick = () => {
    setIsLoggingIn(true);
    setTimeout(onLogin, 2000);
  };

  if (isLoggingIn) {
    return (
      <div className="min-h-screen w-full bg-[#5a7edc] flex items-center justify-center overflow-hidden relative">
        {/* Top and Bottom Borders */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#00309c]" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00309c]" />

        {/* Main Content */}
        <div className="w-full flex items-center justify-center relative">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7a9ce8] to-transparent opacity-30" />

          <div className="flex items-center gap-8 z-10">
            <div className="w-16 h-16 bg-white rounded border-2 border-[#fff] shadow-lg overflow-hidden flex items-center justify-center">
              <img
                src={userAvatar}
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-white text-4xl italic font-semibold tracking-wide" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {t.welcome || 'welcome'}
              </h1>
              <div className="text-white/80 text-sm mt-1">Loading your personal settings...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: '#1231a1',
        paddingTop: '78px',
        paddingBottom: '94px'
      }}
    >
      {/* Decorative top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[80px]"
        style={{
          background: '#00309c',
          borderBottom: '2px solid #fff'
        }}
      />

      {/* Main content area with radial gradient */}
      <div
        className="w-full h-full flex items-center justify-center relative"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #91b0ee 0%, #5a7edc 100%)'
        }}
      >
        {/* Decorative bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[80px]"
          style={{
            background: '#00309c',
            borderTop: '2px solid #fff'
          }}
        />

        <div className="w-full max-w-4xl flex items-center z-10">
          <div className="w-1/2 text-right pr-12 border-r border-white/30 py-12">
            <div className="mb-8">
              <h1
                className="text-white text-4xl font-light mb-2"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontStyle: 'italic' }}
              >
                Microsoft
              </h1>
              <h2 className="text-white text-5xl font-bold">Windows<span className="text-orange-400 text-2xl align-top">xp</span></h2>
            </div>
            <p className="text-white text-xl opacity-80">{t.loginTitle}</p>
          </div>

          <div className="w-1/2 pl-12 py-12">
            <button
              onClick={handleUserClick}
              className="group flex items-center gap-4 p-2 rounded hover:bg-blue-700/30 transition-colors w-full text-left"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded border-2 border-white shadow-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                <img
                  src={userAvatar}
                  alt="User"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-transparent" style={{ zIndex: -1 }}>
                  <User size={32} className="text-white" />
                </div>
              </div>
              <div>
                <span className="text-white text-2xl block group-hover:underline">{t.user}</span>
                <span className="text-blue-200 text-sm">Computer Administrator</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-8 flex gap-4 z-20">
        <button
          className="flex items-center gap-2 text-white hover:underline"
          onClick={() => setMode('grub')}
        >
          <div className="w-8 h-8 bg-blue-900 rounded border border-white flex items-center justify-center">
            <Power size={16} className="text-white" />
          </div>
          <span>Turn off computer</span>
        </button>
      </div>
    </div>
  );
}
