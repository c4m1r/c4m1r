import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, detectLanguage } from '../i18n/translations';

type Mode = 'grub' | 'blog' | 'webos' | 'terminal';
export type ThemeId = 'win-98' | 'win-xp' | 'webos' | 'win7' | 'win10' | 'win11' | 'ubuntu' | 'arch' | 'halloween';

interface AppContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const LANGUAGE_STORAGE_KEY = 'webos-language';

const supportedLanguages: Language[] = ['en', 'ru', 'fr', 'es', 'zh', 'ja', 'ko'];

const isLanguage = (value: string | null): value is Language =>
  !!value && (supportedLanguages as readonly string[]).includes(value);

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isLanguage(stored)) {
    return stored;
  }
  return detectLanguage();
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('grub');
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<ThemeId>('win-xp');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  return (
    <AppContext.Provider value={{ mode, setMode, language, setLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

