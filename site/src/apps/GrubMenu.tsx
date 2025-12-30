import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../i18n/translations';

type GrubOption = 'blog' | 'webos' | 'win-xp' | 'win-98' | 'win7' | 'terminal';

export function GrubMenu() {
  const { setMode, setTheme, language } = useApp();
  const t = translations[language].grub;
  const [selectedIndex, setSelectedIndex] = useState(1); // Windows XP по умолчанию
  const [countdown, setCountdown] = useState(3);
  const [autobootActive, setAutobootActive] = useState(true);

  const options: { key: GrubOption; label: string }[] = [
    { key: 'blog', label: t.blogSite || 'Сайт' },
    { key: 'win-xp', label: 'Windows XP' },
    { key: 'win-98', label: 'Windows 98' },
    { key: 'win7', label: 'Windows 7' },
    { key: 'terminal', label: t.terminal || 'Терминал' },
    { key: 'webos', label: t.webos || 'WebOS' },
  ];

  useEffect(() => {
    if (!autobootActive) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleBoot(options[selectedIndex].key);
    }
  }, [countdown, autobootActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        setAutobootActive(false);
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      } else if (key === 'enter') {
        e.preventDefault();
        handleBoot(options[selectedIndex].key);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      setAutobootActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [selectedIndex]);

  const handleBoot = (option: GrubOption) => {
    switch (option) {
      case 'webos':
        setTheme('webos');
        setMode('webos');
        return;
      case 'win-xp':
        setTheme('win-xp');
        setMode('webos');
        return;
      case 'win-98':
        setTheme('win-98');
        setMode('webos');
        return;
      case 'win7':
        setTheme('win7');
        setMode('webos');
        return;
      case 'blog':
        setMode('blog');
        return;
      case 'terminal':
        setMode('terminal');
        return;
      default:
        return;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 flex flex-col">
      <div className="mb-8">
        <div className="text-gray-400">{t.title || 'GRUB Boot Loader'}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-2xl">
        <div className="space-y-1 mb-8">
          {options.map((option, index) => (
            <div
              key={option.key}
              className={`px-4 py-2 cursor-pointer select-none ${
                index === selectedIndex
                  ? 'bg-white text-black'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              onClick={() => {
                setSelectedIndex(index);
                setAutobootActive(false);
                handleBoot(option.key);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setSelectedIndex(index);
                setAutobootActive(false);
                handleBoot(option.key);
              }}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {option.label}
            </div>
          ))}
        </div>

        {autobootActive && (
          <div className="text-gray-400 mb-4">
            {(t.autoboot || 'Автозагрузка через {seconds} сек...').replace(
              '{seconds}',
              countdown.toString()
            )}
          </div>
        )}

        <div className="text-gray-400 whitespace-pre-line text-sm">
          {t.hint || 'Используйте стрелки ↑↓ для выбора, Enter для загрузки'}
        </div>
      </div>
    </div>
  );
}
