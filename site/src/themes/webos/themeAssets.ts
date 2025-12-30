// WebOS assets - используем assets из winxp темы
import folderPlainWebos from '../winxp/assets/icons/folder_plain.png';
import myComputerWebos from '../winxp/assets/icons/mycomputer.png';
import recycleBinWebos from '../winxp/assets/icons/recycling_bin.png';
import folderDocumentsWebos from '../winxp/assets/icons/folder-documents.png';
import folderPicturesWebos from '../winxp/assets/icons/folder-pictures.png';
import folderMusicWebos from '../winxp/assets/icons/folder-music.png';
import folderRecentWebos from '../winxp/assets/icons/folder-recent.png';
import startIconWebos from '../winxp/assets/widgets/windows.png';
import trayExpandWebos from '../winxp/assets/widgets/tray-expand.png';
import ieIconWebos from '../winxp/assets/icons/ie.png';
import mailIconWebos from '../winxp/assets/icons/outlook.png';
import mediaPlayerIconWebos from '../winxp/assets/icons/mediaplayer.png';
import gamesIconWebos from '../winxp/assets/icons/pinball.png';
import projectsIconWebos from '../winxp/assets/icons/folder_program.png';
import userAvatarWebos from '../winxp/assets/user.gif';
import windowsLogoWebos from '../winxp/assets/windows.png';
import bootWallpaperWebos from '../../content/pictures/wallpapers/winxp-bliss.jpg';
import minesweeperIconWebos from '../../apps/minesweeper/assets/icon.png';
import calculatorIconWebos from '../winxp/assets/icons/calc.png';
import paintIconWebos from '../winxp/assets/icons/paint.png';
import controlPanelIconWebos from '../winxp/assets/icons/hardware.png';
import notepadIconWebos from '../winxp/assets/icons/Notepad.png';
import richTextIconWebos from '../winxp/assets/icons/filetypes/rich-text.png';
import bootLogoWebos from '../winxp/assets/boot/boot-windows-logo.png';
import bootProgressWebos from '../winxp/assets/boot/boot-progress.png';
import doomIconWebos from '../../apps/doom/assets/doom-icon-sm.webp';
import gamesFolderIconWebos from '../winxp/assets/icons/filetypes/folder-favorites.png';
import appearanceIconWebos from '../winxp/assets/icons/appearance.png';
import networkIconWebos from '../winxp/assets/icons/internet.png';
import addRemoveIconWebos from '../winxp/assets/icons/folder_program.png';
import soundIconWebos from '../winxp/assets/icons/sound.png';
import maintenanceIconWebos from '../winxp/assets/icons/green_shield.png';
import hardwareIconWebos from '../winxp/assets/icons/printers-and-faxes.png';
import usersIconWebos from '../winxp/assets/icons/users.png';
import regionalIconWebos from '../winxp/assets/icons/earth.png';
import accessibilityIconWebos from '../winxp/assets/icons/help.png';
import volumeIconWebos from '../winxp/assets/icons/Volume.png';
import muteIconWebos from '../winxp/assets/icons/Mute.png';
import fullscreenIconWebos from '../winxp/assets/icons/full-screen-icon-sm.webp';
import notificationIconWebos from '../winxp/assets/icons/Information.png';

type StartMenuIconSet = {
  internetExplorer?: string;
  outlook?: string;
  windowsMediaPlayer?: string;
  games?: string;
  projects?: string;
  minesweeper?: string;
  calculator?: string;
  paint?: string;
};

type PlaceIconSet = {
  myDocuments?: string;
  myPictures?: string;
  myMusic?: string;
  myComputer?: string;
  recentDocuments?: string;
  controlPanel?: string;
  programAccess?: string;
  connectTo?: string;
  printers?: string;
  help?: string;
  search?: string;
  run?: string;
};

export type ThemeAssetId = 'webos' | 'win-xp' | 'win-98';

export interface ThemeAssets {
  folderIcon?: string;
  computerIcon?: string;
  recycleIcon?: string;
  startButtonIcon?: string;
  trayExpandIcon?: string;
  wallpaper?: string;
  userAvatar?: string;
  internetExplorerIcon?: string;
  mailIcon?: string;
  mediaPlayerIcon?: string;
  gamesIcon?: string;
  doomIcon?: string;
  gamesFolderIcon?: string;
  projectsIcon?: string;
  minesweeperIcon?: string;
  calculatorIcon?: string;
  paintIcon?: string;
  controlPanelIcon?: string;
  notepadIcon?: string;
  richTextIcon?: string;
  bootLogo?: string;
  bootProgress?: string;
  startupSound?: string;
  shutdownSound?: string;
  logoffSound?: string;
  volumeIcon?: string;
  muteIcon?: string;
  fullscreenIcon?: string;
  notificationIcon?: string;
  startMenuIcons: StartMenuIconSet;
  placesIcons: PlaceIconSet;
  uiSounds?: {
    menuOpen?: string;
    menuClose?: string;
    menuHover?: string;
    launchApp?: string;
    minimize?: string;
    restore?: string;
    error?: string;
    closeWindow?: string;
  };
  controlPanelIcons?: Record<string, string>;
}

const sharedWebosAssets: ThemeAssets = {
  folderIcon: folderPlainWebos,
  computerIcon: myComputerWebos,
  recycleIcon: recycleBinWebos,
  startButtonIcon: windowsLogoWebos,
  trayExpandIcon: trayExpandWebos,
  wallpaper: bootWallpaperWebos,
  userAvatar: userAvatarWebos,
  internetExplorerIcon: ieIconWebos,
  mailIcon: mailIconWebos,
  mediaPlayerIcon: mediaPlayerIconWebos,
  gamesIcon: gamesIconWebos,
  gamesFolderIcon: gamesFolderIconWebos,
  projectsIcon: projectsIconWebos,
  minesweeperIcon: minesweeperIconWebos,
  calculatorIcon: calculatorIconWebos,
  paintIcon: paintIconWebos,
  controlPanelIcon: controlPanelIconWebos,
  doomIcon: doomIconWebos,
  notepadIcon: notepadIconWebos,
  richTextIcon: richTextIconWebos,
  bootLogo: bootLogoWebos,
  bootProgress: bootProgressWebos,
  volumeIcon: volumeIconWebos,
  muteIcon: muteIconWebos,
  fullscreenIcon: fullscreenIconWebos,
  notificationIcon: notificationIconWebos,
  startupSound: '/sounds/system/xp-startup.mp3',
  shutdownSound: '/sounds/system/xp-shutdown.mp3',
  logoffSound: '/sounds/system/xp-logoff.mp3',
  uiSounds: {
    menuOpen: '/sounds/ui/xp-menu-open.mp3',
    menuClose: '/sounds/ui/xp-menu-close.mp3',
    menuHover: '/sounds/ui/xp-menu-hover.mp3',
    launchApp: '/sounds/ui/xp-launch.mp3',
    minimize: '/sounds/ui/xp-minimize.mp3',
    restore: '/sounds/ui/xp-restore.mp3',
    error: '/sounds/ui/xp-error.mp3',
  },
  startMenuIcons: {
    internetExplorer: ieIconWebos,
    outlook: mailIconWebos,
    windowsMediaPlayer: mediaPlayerIconWebos,
    games: gamesIconWebos,
    projects: projectsIconWebos,
    minesweeper: minesweeperIconWebos,
    calculator: calculatorIconWebos,
    paint: paintIconWebos,
  },
  placesIcons: {
    myDocuments: folderDocumentsWebos,
    myPictures: folderPicturesWebos,
    myMusic: folderMusicWebos,
    myComputer: myComputerWebos,
    recentDocuments: folderRecentWebos,
    controlPanel: folderPlainWebos,
    programAccess: folderPlainWebos,
    connectTo: folderPlainWebos,
    printers: folderPlainWebos,
    help: folderPlainWebos,
    search: folderPlainWebos,
    run: folderPlainWebos,
  },
  controlPanelIcons: {
    appearance: appearanceIconWebos,
    network: networkIconWebos,
    programs: addRemoveIconWebos,
    sounds: soundIconWebos,
    maintenance: maintenanceIconWebos,
    hardware: hardwareIconWebos,
    users: usersIconWebos,
    regional: regionalIconWebos,
    accessibility: accessibilityIconWebos,
  },
};

const xpThemeAssets: ThemeAssets = {
  ...sharedWebosAssets,
  startMenuIcons: { ...sharedWebosAssets.startMenuIcons },
  placesIcons: { ...sharedWebosAssets.placesIcons },
};

export const THEME_ASSETS: Record<ThemeAssetId, ThemeAssets> = {
  webos: sharedWebosAssets,
  'win-xp': xpThemeAssets,
  'win-98': {
    startupSound: '/sounds/system/win98-startup.mp3',
    shutdownSound: '/sounds/system/win98-shutdown.mp3',
    logoffSound: '/sounds/system/win98-logoff.mp3',
    uiSounds: {
      menuOpen: '/sounds/ui/win98-menu-open.mp3',
      menuClose: '/sounds/ui/win98-menu-close.mp3',
      launchApp: '/sounds/ui/win98-launch.mp3',
      minimize: '/sounds/ui/win98-minimize.mp3',
      restore: '/sounds/ui/win98-restore.mp3',
      error: '/sounds/ui/win98-error.mp3',
    },
    startMenuIcons: {},
    placesIcons: {},
  },
};
