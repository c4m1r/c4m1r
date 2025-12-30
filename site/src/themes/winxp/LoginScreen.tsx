import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { Power } from 'lucide-react';
import userAvatar from './assets/avatars/profile.gif';
import './xp.css';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setMode } = useApp();
  const t = translations[language].xp;
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUserClick = () => {
    setIsLoggingIn(true);
    setTimeout(onLogin, 2000);
  };

  const handleShutdown = () => {
    setMode('grub');
  };

  if (isLoggingIn) {
    return (
      <div className="min-h-screen w-full bg-[#5a7edc] flex items-center justify-center overflow-hidden relative">
        <div className="text-center text-white flex flex-col items-center gap-6">
          <div className="text-2xl font-medium">{t.loggingIn || 'Загрузка персональных настроек...'}</div>
          <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full login-screen-xp">
      <div className="login-screen__container">
        <div className="login-screen__header">
          <h2 className="login-screen__title">{t.welcomeMessage || 'Для начала работы нажмите на имя пользователя'}</h2>
        </div>

        <div className="login-screen__users">
          <button
            onClick={handleUserClick}
            className="login-screen__user-card"
          >
            <div className="login-screen__user-avatar">
              <img
                src={userAvatar}
                alt="C4m1r"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="login-screen__user-name">C4m1r</div>
          </button>
        </div>

        <div className="login-screen__footer">
          <button
            onClick={handleShutdown}
            className="login-screen__shutdown-btn"
          >
            <Power size={20} />
            <span>{t.turnOffComputer || 'Выключение компьютера'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

