export type ThemeId = 'webos' | 'win-xp' | 'win-98';

export interface ThemeStyleConfig {
  body: string[];
  startButton: string[];
  startButtonOpen: string[];
  taskbar: string[];
  systemTray: string[];
}

const baseStartButtonClass = 'start-button-base';

export const THEME_STYLES: Record<ThemeId, ThemeStyleConfig> = {
  webos: {
    body: ['theme-webos'],
    startButton: [baseStartButtonClass, 'start-button-webos'],
    startButtonOpen: [baseStartButtonClass, 'start-button-webos', 'start-button--open'],
    taskbar: ['theme-webos', 'taskbar-webos', 'text-white'],
    systemTray: ['system-tray-webos'],
  },
  'win-xp': {
    body: ['theme-win-xp'],
    startButton: [baseStartButtonClass, 'start-button-win-xp'],
    startButtonOpen: [baseStartButtonClass, 'start-button-win-xp', 'start-button--open'],
    taskbar: ['theme-win-xp', 'taskbar-win-xp', 'text-white'],
    systemTray: ['system-tray-win-xp'],
  },
  'win-98': {
    body: ['theme-98'],
    startButton: ['start-button-98'],
    startButtonOpen: ['start-button-98'],
    taskbar: ['theme-98', 'taskbar-98', 'text-black'],
    systemTray: ['system-tray-98'],
  },
};

