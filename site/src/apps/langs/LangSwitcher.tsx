import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { Language } from '../../i18n/translations';
import flagEn from './flag-en.webp';
import flagFr from './flag-fr.webp';

const languageOrder: Language[] = ['en', 'ru', 'fr', 'es', 'zh', 'ja', 'ko'];

const languageMeta: Record<Language, { code: string; title: string; icon?: string }> = {
  en: { code: 'EN', title: 'English', icon: flagEn },
  ru: { code: 'RU', title: 'Русский' },
  fr: { code: 'FR', title: 'Français', icon: flagFr },
  es: { code: 'ES', title: 'Español' },
  zh: { code: '中文', title: '中文' },
  ja: { code: 'JP', title: '日本語' },
  ko: { code: 'KR', title: '한국어' },
};

interface LangSwitcherProps {
  variant?: 'default' | 'tray';
  buttonClassName?: string;
}

export function LangSwitcher({ variant = 'default', buttonClassName }: LangSwitcherProps) {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  const current = languageMeta[language];

  const renderBadge = (lang: Language, minimal = false) => {
    const meta = languageMeta[lang];
    if (meta.icon) {
      return (
        <img
          src={meta.icon}
          alt={meta.title}
          className={`${minimal ? 'w-4 h-3' : 'w-4 h-3'} object-cover rounded-[2px]`}
        />
      );
    }
    return (
      <span className={`text-[10px] font-bold tracking-wide px-1 py-0.5 rounded-sm ${minimal ? 'bg-transparent text-white' : 'bg-black/30 text-white'}`}>
        {meta.code}
      </span>
    );
  };

  const triggerClass = [
    variant === 'tray'
      ? 'taskbar-tray-icon'
      : 'flex items-center gap-1 px-2 h-6 rounded-sm border border-white/30 bg-white/10 hover:bg-white/20 transition-colors',
    buttonClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative" ref={containerRef}>
      <button
        className={triggerClass}
        onClick={() => setOpen((prev) => !prev)}
        title={current.title}
      >
        {renderBadge(language, variant === 'tray')}
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-1 bg-[#f8f8f8] text-black rounded shadow-lg border border-[#b4b4b4] min-w-[140px] z-[1000]">
          {languageOrder.map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-[12px] hover:bg-[#dbe6ff] ${
                lang === language ? 'font-semibold text-[#0b49c5]' : 'text-[#1b1b1b]'
              }`}
            >
              {renderBadge(lang)}
              <span className="flex-1">{languageMeta[lang].title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}