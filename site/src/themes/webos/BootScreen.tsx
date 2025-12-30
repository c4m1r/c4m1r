import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { THEME_ASSETS, ThemeAssetId } from './themeAssets';

interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const { theme } = useApp();
  const themeAssets = THEME_ASSETS[(theme as ThemeAssetId) ?? 'webos'] ?? THEME_ASSETS.webos;
  const bootLogo = themeAssets.bootLogo;
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (theme === 'win-98') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-white text-6xl font-bold mb-4">Windows<span className="text-teal-500">98</span></h1>
          <div className="w-64 h-4 border-2 border-gray-500 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-800 to-blue-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="boot-screen boot-screen--xp"
      style={{ opacity: fadeIn ? 1 : 0 }}
    >
      <div className="boot-screen__center">
        {bootLogo && !logoFailed && (
          <img
            src={bootLogo}
            alt="Windows"
            className="boot-screen__logo"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              setLogoFailed(true);
            }}
          />
        )}
        {(logoFailed || !bootLogo) && (
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
      <div className="boot-screen__brand">
        <img src="/images/xp_loading_mslogo.jpg" alt="Microsoft" />
      </div>

      <style>{`
        .boot-screen.boot-screen--xp {
          min-height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
          font-size: 14px;
          padding: 40px 32px;
          transition: opacity 500ms linear;
          position: relative;
          overflow: hidden;
        }

        .boot-screen__center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 48px;
          margin-bottom: 80px;
        }

        .boot-screen__logo {
          width: 400px;
          max-width: 80vw;
        }

        .boot-screen__fallback {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .boot-screen__fallback-logo {
          width: 64px;
          height: 64px;
          position: relative;
        }

        .boot-screen__fallback-logo::before,
        .boot-screen__fallback-logo::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #d84141, #e7b22a 45%, #4aa048 70%, #3a6ad7);
        }

        .boot-screen__fallback-logo::after {
          inset: 10px;
          background: #fff;
          transform: rotate(45deg);
        }

        .boot-screen__fallback-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .boot-screen__fallback-brand {
          font-size: 36px;
          font-style: italic;
          font-weight: 600;
        }

        .boot-screen__fallback-product {
          font-size: 28px;
          font-weight: 700;
        }

        .boot-screen__loader {
          width: 180px;
          height: 26px;
          border: 2px solid #b2b2b2;
          border-radius: 8px;
          padding: 3px 1px;
          overflow: hidden;
          font-size: 0;
          display: flex;
          align-items: center;
        }

        .boot-screen__loader div {
          width: 12px;
          height: 100%;
          margin-right: 3px;
          background: linear-gradient(to bottom, #2838c7 0%, #5979ef 20%, #869ef3 45%, #5979ef 70%, #2838c7 100%);
          animation: bootLoader 1.8s linear infinite;
        }

        .boot-screen__loader div:nth-child(2) {
          animation-delay: 0.2s;
        }

        .boot-screen__loader div:nth-child(3) {
          animation-delay: 0.4s;
        }

        .boot-screen__copyright,
        .boot-screen__brand {
          position: absolute;
          bottom: 40px;
          font-family: 'Arial', sans-serif;
          font-size: 16px;
        }

        .boot-screen__copyright {
          left: 40px;
        }

        .boot-screen__brand {
          right: 40px;
        }

        .boot-screen__brand img {
          width: 120px;
          height: auto;
        }

        @keyframes bootLoader {
          0% {
            transform: translateX(-60px);
          }
          100% {
            transform: translateX(220px);
          }
        }
      `}</style>
    </div>
  );
}
