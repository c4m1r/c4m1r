/**
 * Конфигурация всех тем
 * Централизованная система управления темами
 */

import type { ThemeId } from '../contexts/AppContext';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  family: 'windows' | 'linux' | 'other';
  version?: string;
  hasBootScreen: boolean;
  hasLoginScreen: boolean;
  hasWelcomeScreen: boolean;
  cssFile: string;
  assetsPath: string;
  defaultWallpaper: string;
  soundsEnabled: boolean;
}

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  'win-xp': {
    id: 'win-xp',
    name: 'Windows XP',
    family: 'windows',
    version: 'Professional',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: true,
    cssFile: './themes/winxp/xp.css',
    assetsPath: './themes/winxp/assets',
    defaultWallpaper: '/src/content/pictures/wallpapers/winxp-bliss.jpg',
    soundsEnabled: true,
  },
  'webos': {
    id: 'webos',
    name: 'WebOS',
    family: 'windows',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: true,
    cssFile: './themes/winxp/xp.css', // Использует те же стили что и XP
    assetsPath: './themes/winxp/assets',
    defaultWallpaper: '/src/content/pictures/wallpapers/winxp-bliss.jpg',
    soundsEnabled: true,
  },
  'win-98': {
    id: 'win-98',
    name: 'Windows 98',
    family: 'windows',
    version: 'Second Edition',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // Стили Win98 включены в xp.css
    assetsPath: './themes/win98',
    defaultWallpaper: '',
    soundsEnabled: true,
  },
  'win7': {
    id: 'win7',
    name: 'Windows 7',
    family: 'windows',
    version: 'Ultimate',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/win7',
    defaultWallpaper: '',
    soundsEnabled: true,
  },
  'win10': {
    id: 'win10',
    name: 'Windows 10',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/win10',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'win11': {
    id: 'win11',
    name: 'Windows 11',
    family: 'windows',
    hasBootScreen: false,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/win11',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'ubuntu': {
    id: 'ubuntu',
    name: 'Ubuntu',
    family: 'linux',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/ubuntu',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'arch': {
    id: 'arch',
    name: 'Arch Linux',
    family: 'linux',
    hasBootScreen: true,
    hasLoginScreen: true,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/arch',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
  'halloween': {
    id: 'halloween',
    name: 'Halloween Edition',
    family: 'other',
    hasBootScreen: false,
    hasLoginScreen: false,
    hasWelcomeScreen: false,
    cssFile: './themes/winxp/xp.css', // TODO: Создать отдельный CSS
    assetsPath: './themes/halloween',
    defaultWallpaper: '',
    soundsEnabled: false,
  },
};

/**
 * Получить конфигурацию темы
 */
export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEME_CONFIGS[themeId] || THEME_CONFIGS['win-xp'];
}

/**
 * Проверить, является ли тема частью Windows XP семейства
 */
export function isXPFamily(themeId: ThemeId): boolean {
  return ['win-xp', 'webos'].includes(themeId);
}

/**
 * Проверить, является ли тема частью Windows семейства
 */
export function isWindowsFamily(themeId: ThemeId): boolean {
  return THEME_CONFIGS[themeId]?.family === 'windows';
}

