import { useEffect, useState } from 'react';
import bootLogo from './assets/boot/boot-windows-logo.png';
import './xp.css';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    // Автоматическое завершение через 3 секунды
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="boot-screen boot-screen--xp"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      <div className="boot-screen__center">
        {!logoFailed && (
          <img
            src={bootLogo}
            alt="Windows XP"
            className="boot-screen__logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setLogoFailed(true);
            }}
          />
        )}
        {logoFailed && (
          <div className="boot-screen__fallback">
            <div className="boot-screen__fallback-logo" />
            <div className="boot-screen__fallback-text">
              <span className="boot-screen__fallback-brand">Microsoft</span>
              <span className="boot-screen__fallback-product">Windows XP</span>
            </div>
          </div>
        )}
        <div className="boot-screen__loader">
          <div />
          <div />
          <div />
        </div>
      </div>

      <div className="boot-screen__copyright">Copyright © Microsoft Corporation</div>
    </div>
  );
}

