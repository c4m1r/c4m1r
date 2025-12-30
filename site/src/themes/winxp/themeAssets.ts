/**
 * Windows XP Theme Assets
 * Централизованная конфигурация ассетов для темы Windows XP
 */

// Иконки
import folderPlainXp from './assets/icons/folder_plain.png';
import myComputerXp from './assets/icons/mycomputer.png';
import recycleBinXp from './assets/icons/recycling_bin.png';
import folderDocumentsXp from './assets/icons/folder-documents.png';
import folderPicturesXp from './assets/icons/folder-pictures.png';
import folderMusicXp from './assets/icons/folder-music.png';
import folderRecentXp from './assets/icons/folder-recent.png';
import ieIconXp from './assets/icons/ie.png';
import mailIconXp from './assets/icons/outlook.png';
import mediaPlayerIconXp from './assets/icons/mediaplayer.png';
import gamesIconXp from './assets/icons/pinball.png';
import projectsIconXp from './assets/icons/folder_program.png';
import calculatorIconXp from './assets/icons/calc.png';
import paintIconXp from './assets/icons/paint.png';
import controlPanelIconXp from './assets/icons/hardware.png';
import notepadIconXp from './assets/icons/Notepad.png';
import richTextIconXp from './assets/icons/filetypes/rich-text.png';
import gamesFolderIconXp from './assets/icons/filetypes/folder-favorites.png';
import volumeIconXp from './assets/icons/Volume.png';
import muteIconXp from './assets/icons/Mute.png';
import fullscreenIconXp from './assets/icons/full-screen-icon-sm.webp';
import notificationIconXp from './assets/icons/Information.png';

// Widgets
import startIconXp from './assets/widgets/windows.png';
import trayExpandXp from './assets/widgets/tray-expand.png';

// User
import userAvatarXp from './assets/user.gif';
import windowsLogoXp from './assets/windows.png';

// Boot
import bootLogoXp from './assets/boot/boot-windows-logo.png';
import bootProgressXp from './assets/boot/boot-progress.png';

// Wallpaper
import bootWallpaperXp from '../../content/pictures/wallpapers/winxp-bliss.jpg';

// Minesweeper
import minesweeperIconXp from '../../apps/minesweeper/assets/icon.png';

export interface WinXPAssets {
  folderIcon: string;
  computerIcon: string;
  recycleIcon: string;
  startButtonIcon: string;
  trayExpandIcon: string;
  wallpaper: string;
  userAvatar: string;
  internetExplorerIcon: string;
  mailIcon: string;
  mediaPlayerIcon: string;
  gamesIcon: string;
  gamesFolderIcon?: string;
  projectsIcon: string;
  minesweeperIcon: string;
  calculatorIcon: string;
  paintIcon: string;
  controlPanelIcon: string;
  notepadIcon: string;
  richTextIcon: string;
  bootLogo: string;
  bootProgress: string;
  volumeIcon: string;
  muteIcon: string;
  fullscreenIcon: string;
  notificationIcon: string;
}

export const WINXP_ASSETS: WinXPAssets = {
  folderIcon: folderPlainXp,
  computerIcon: myComputerXp,
  recycleIcon: recycleBinXp,
  startButtonIcon: windowsLogoXp,
  trayExpandIcon: trayExpandXp,
  wallpaper: bootWallpaperXp,
  userAvatar: userAvatarXp,
  internetExplorerIcon: ieIconXp,
  mailIcon: mailIconXp,
  mediaPlayerIcon: mediaPlayerIconXp,
  gamesIcon: gamesIconXp,
  gamesFolderIcon: gamesFolderIconXp,
  projectsIcon: projectsIconXp,
  minesweeperIcon: minesweeperIconXp,
  calculatorIcon: calculatorIconXp,
  paintIcon: paintIconXp,
  controlPanelIcon: controlPanelIconXp,
  notepadIcon: notepadIconXp,
  richTextIcon: richTextIconXp,
  bootLogo: bootLogoXp,
  bootProgress: bootProgressXp,
  volumeIcon: volumeIconXp,
  muteIcon: muteIconXp,
  fullscreenIcon: fullscreenIconXp,
  notificationIcon: notificationIconXp,
};

