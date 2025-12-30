import { useEffect } from 'react';
import './xp.css';

type TransitionMode = 'logoff' | 'shutdown';

interface SystemTransitionScreenProps {
  mode: TransitionMode;
  onComplete: () => void;
  duration?: number;
}

const XP_MESSAGES: Record<TransitionMode, { title: string; subtitle: string }> = {
  logoff: {
    title: 'Завершение сеанса...',
    subtitle: 'Сохранение параметров',
  },
  shutdown: {
    title: 'Windows завершает работу...',
    subtitle: 'Сохранение параметров',
  },
};

export function SystemTransitionScreen({ mode, onComplete, duration }: SystemTransitionScreenProps) {
  const timeout = duration ?? (mode === 'shutdown' ? 3500 : 2200);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, timeout);
    return () => window.clearTimeout(timer);
  }, [onComplete, timeout]);

  const messages = XP_MESSAGES[mode];

  return (
    <div className="system-transition-xp">
      <div className="system-transition__line-top" />
      <div className="system-transition__line-bottom" />

      <div className="system-transition__content">
        <div className="system-transition__spinner">
          <div className="system-transition__spinner-outer" />
          <div className="system-transition__spinner-inner" />
        </div>
        <h1 className="system-transition__title">
          {messages.title}
        </h1>
        {messages.subtitle && (
          <p className="system-transition__subtitle">
            {messages.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

