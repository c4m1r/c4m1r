import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { ThemeId } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { loadMarkdownContent } from '../../utils/contentLoader';
import { StartMenu } from './StartMenu';
import { Window } from '../../apps/desktop/Window';
import { ErrorBox } from './ErrorBox';
import { Notepad } from '../../apps/notepad';
import { BlogApp } from '../../apps/BlogApp';
import { WikiApp } from '../../apps/wiki/WikiApp';
import { PicturesGallery } from '../../apps/pictureview/PicturesGallery';
import { PictureViewer } from '../../apps/pictureview';
import { ContextMenu, ContextMenuItem } from '../../apps/desktop/components';
import { MyComputer } from '../../apps/explorer';
import { Minesweeper } from '../../apps/minesweeper';
import { RunDialog } from './RunDialog';
import { Folder, HardDrive, Trash2 } from 'lucide-react';
import { getItemsFromPath, getFileIcon, FileSystemItem } from '../../utils/FileSystem';
import minesweeperIcon from '../../apps/minesweeper/assets/icon.png';
import { useWindowManagerState } from '../../apps/desktop/windowManager';
import { InternetExplorer } from '../../apps/internetexplorer/InternetExplorer';
import { WindowsMediaPlayer } from '../../apps/mediaplayer/WindowsMediaPlayer';
import { DoomPlayer } from '../../apps/doom/DoomPlayer';
import { GamesFolder } from '../../apps/games/GamesFolder';
import { doomVariantMap, DoomVariantId } from '../../apps/doom/config';
import { OutlookExpress } from '../../apps/outlook/OutlookExpress';
import { Calculator } from '../../apps/calc/Calculator';
import { Paint } from '../../apps/paint/Paint';
import { ControlPanel } from '../../apps/ControlPanel';
import { TaskManager } from '../../apps/TaskManager';
import { Terminal } from '../../apps/Terminal';
import { AboutApp } from '../../apps/AboutApp';
import { CalendarApp } from '../../apps/calendar';
import { LangSwitcher } from '../../apps/langs/LangSwitcher';
import { MyCV } from '../../apps/mycv/MyCV';
import { ProjectsGrid } from '../../apps/ProjectsGrid';
import { THEME_ASSETS } from './themeAssets';
import { THEME_STYLES } from './themeStyles';

const DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';
const MINESWEEPER_WINDOW_ID = 'app:minesweeper';

const XP_FAMILY_THEMES: ThemeId[] = ['win-xp', 'webos'];

const joinWindowsPath = (parent: string, child: string) => {
  if (!parent || parent === 'My Computer') {
    return child;
  }
  if (parent.endsWith('\\')) {
    return `${parent}${child}`;
  }
  if (parent.endsWith(':')) {
    return `${parent}\\${child}`;
  }
  return `${parent}\\${child}`;
};

interface DesktopIcon {
  id: string;
  icon: React.ReactNode;
  label: string;
  type: 'folder' | 'system';
  x?: number;
  y?: number;
}

interface DesktopProps {
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
}

export function Desktop(props?: DesktopProps) {
  const { onSystemCommand } = props ?? {};
  const { language, theme } = useApp();
  const t = translations[language].xp;
  const getViewport = () => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  const [viewport, setViewport] = useState(getViewport());
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [errorWindow, setErrorWindow] = useState<{ id: string; message: string } | null>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(70);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() =>
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );
  const desktopRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const startupPlayedRef = useRef<Record<string, boolean>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const menuHoverCooldownRef = useRef<number>(0);
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindow,
  } = useWindowManagerState();

  const themeKey: ThemeId = theme;
  const themeAssets = THEME_ASSETS[themeKey] ?? THEME_ASSETS.webos;
  const fallbackAssets = THEME_ASSETS.webos;
  const resolveAssetPath = (primary?: string, secondary?: string) => primary ?? secondary ?? '';
  const volumeIconSrc = resolveAssetPath(themeAssets.volumeIcon, fallbackAssets.volumeIcon);
  const muteIconSrc = resolveAssetPath(themeAssets.muteIcon, fallbackAssets.muteIcon);
  const fullscreenIconSrc = resolveAssetPath(themeAssets.fullscreenIcon, fallbackAssets.fullscreenIcon);
  const notificationIconSrc = resolveAssetPath(themeAssets.notificationIcon, fallbackAssets.notificationIcon);
  const textDocumentIcon = resolveAssetPath(
    themeAssets.richTextIcon ?? themeAssets.notepadIcon,
    fallbackAssets.richTextIcon ?? fallbackAssets.notepadIcon ?? fallbackAssets.folderIcon
  );
  const themeStyles = THEME_STYLES[themeKey] ?? THEME_STYLES.webos;
  const blogLabel = translations[language]?.blog?.blog ?? 'Blog';
  const wikiLabel = language === 'ru' ? 'Вики' : 'Wiki';
  const picturesLabel = language === 'ru' ? 'Мои изображения' : 'My Pictures';
  const calendarLabel = language === 'ru' ? 'Календарь' : 'Calendar';
  const terminalLabel = language === 'ru' ? 'Терминал' : 'Terminal';
  const taskManagerLabel = language === 'ru' ? 'Диспетчер задач' : 'Task Manager';
  const aboutLabel = language === 'ru' ? 'Обо мне' : 'About';
  const isXpFamily = XP_FAMILY_THEMES.includes(themeKey);
  const startupSound = resolveAssetPath(themeAssets.startupSound, fallbackAssets.startupSound);
  const shutdownSound = resolveAssetPath(themeAssets.shutdownSound, fallbackAssets.shutdownSound);
  const logoffSound = resolveAssetPath(themeAssets.logoffSound, fallbackAssets.logoffSound);
  const uiSoundSet = themeAssets.uiSounds ?? {};
  const fallbackUiSoundSet = fallbackAssets.uiSounds ?? {};
  const closeWindowSound = resolveAssetPath(uiSoundSet.closeWindow, fallbackUiSoundSet?.closeWindow);
  const startLabel = (t.start ?? 'Start').toLowerCase();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ensureAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    return audioContextRef.current;
  }, []);

  const playFallbackTone = useCallback(
    (frequency: number, duration = 0.12, gainValue = 0.08, type: OscillatorType = 'triangle') => {
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }

      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => undefined);
      }

      const startTime = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(gainValue, startTime);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(startTime);
      const endTime = startTime + duration;
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
      oscillator.stop(endTime + 0.05);
    },
    [ensureAudioContext]
  );

  const playSystemSound = useCallback(
    (
      src?: string,
      volume = 0.55,
      fallback?: { frequency: number; duration?: number; gain?: number; type?: OscillatorType }
    ) => {
      const triggerFallback = () => {
        if (!fallback) {
          return;
        }
        playFallbackTone(fallback.frequency, fallback.duration ?? 0.12, fallback.gain ?? 0.08, fallback.type ?? 'triangle');
      };

      if (!src) {
        triggerFallback();
        return;
      }

      try {
        const audio = new Audio(src);
        audio.volume = volume;
        const handleError = () => {
          audio.removeEventListener('error', handleError);
          triggerFallback();
        };
        audio.addEventListener('error', handleError, { once: true });
        void audio.play().catch(() => {
          audio.removeEventListener('error', handleError);
          triggerFallback();
        });
      } catch {
        triggerFallback();
      }
    },
    [playFallbackTone]
  );
  const menuOpenSound = resolveAssetPath(uiSoundSet.menuOpen, fallbackUiSoundSet?.menuOpen);
  const menuCloseSound = resolveAssetPath(uiSoundSet.menuClose, fallbackUiSoundSet?.menuClose);
  const menuHoverSound = resolveAssetPath(uiSoundSet.menuHover, fallbackUiSoundSet?.menuHover);
  const launchSound = resolveAssetPath(uiSoundSet.launchApp, fallbackUiSoundSet?.launchApp);
  const minimizeSound = resolveAssetPath(uiSoundSet.minimize, fallbackUiSoundSet?.minimize);
  const restoreSound = resolveAssetPath(uiSoundSet.restore, fallbackUiSoundSet?.restore);
  const errorSound = resolveAssetPath(uiSoundSet.error, fallbackUiSoundSet?.error);
  const playLaunchSound = useCallback(() => {
    playSystemSound(launchSound, 0.45, { frequency: 760, duration: 0.14, gain: 0.08 });
  }, [launchSound, playSystemSound]);
  const playMinimizeSound = useCallback(() => {
    playSystemSound(minimizeSound, 0.4, { frequency: 360, duration: 0.12, gain: 0.07 });
  }, [minimizeSound, playSystemSound]);
  const playRestoreSound = useCallback(() => {
    playSystemSound(restoreSound, 0.42, { frequency: 540, duration: 0.12, gain: 0.07 });
  }, [restoreSound, playSystemSound]);
  const playErrorSound = useCallback(() => {
    playSystemSound(errorSound, 0.55, { frequency: 220, duration: 0.28, gain: 0.1, type: 'square' });
  }, [errorSound, playSystemSound]);
  const playCloseWindowSound = useCallback(() => {
    playSystemSound(closeWindowSound, 0.38, { frequency: 480, duration: 0.1, gain: 0.06 });
  }, [closeWindowSound, playSystemSound]);
  const handleMenuHoverSound = useCallback(() => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - menuHoverCooldownRef.current < 110) {
      return;
    }
    menuHoverCooldownRef.current = now;
    playSystemSound(menuHoverSound, 0.35, { frequency: 820, duration: 0.08, gain: 0.05 });
  }, [menuHoverSound, playSystemSound]);
  const openStartMenu = useCallback(() => {
    let didOpen = false;
    setShowStartMenu((prev) => {
      if (!prev) {
        didOpen = true;
        return true;
      }
      return prev;
    });
    if (didOpen) {
      playSystemSound(menuOpenSound, 0.42, { frequency: 700, duration: 0.11, gain: 0.07 });
    }
  }, [menuOpenSound, playSystemSound]);
  const closeStartMenu = useCallback(() => {
    let didClose = false;
    setShowStartMenu((prev) => {
      if (prev) {
        didClose = true;
        return false;
      }
      return prev;
    });
    if (didClose) {
      playSystemSound(menuCloseSound, 0.42, { frequency: 520, duration: 0.1, gain: 0.07 });
    }
  }, [menuCloseSound, playSystemSound]);

  useEffect(() => {
    if (!startupSound) {
      return;
    }

    if (!startupPlayedRef.current[themeKey]) {
      playSystemSound(startupSound, 0.5);
      startupPlayedRef.current[themeKey] = true;
    }
  }, [startupSound, playSystemSound, themeKey]);

  const handleSystemCommand = useCallback(
    (command: 'logoff' | 'shutdown') => {
      if (command === 'shutdown') {
        playSystemSound(shutdownSound, 0.6);
      } else {
        playSystemSound(logoffSound, 0.6);
      }
      onSystemCommand?.(command);
    },
    [shutdownSound, logoffSound, playSystemSound, onSystemCommand]
  );

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleVolumeToggle = useCallback(() => {
    setShowVolumePanel((prev) => !prev);
    setShowNotificationPanel(false);
  }, []);

  const handleNotificationToggle = useCallback(() => {
    setShowNotificationPanel((prev) => !prev);
    setShowVolumePanel(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setShowVolumePanel(false);
        setShowNotificationPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        setShowRunDialog(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        setShowTaskManager(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getIconElement = (iconType: 'folder' | 'computer' | 'recycle') => {
    if (isXpFamily) {
      const icons = {
        folder: themeAssets.folderIcon,
        computer: themeAssets.computerIcon,
        recycle: themeAssets.recycleIcon,
      };
      const iconPath = icons[iconType];
      if (iconPath) {
        return <img src={iconPath} alt="" className="w-12 h-12" onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
      }
    }
    switch (iconType) {
      case 'folder':
        return <Folder size={48} />;
      case 'computer':
        return <HardDrive size={48} />;
      case 'recycle':
        return <Trash2 size={48} />;
    }
  };

  const desktopItems = getItemsFromPath(DESKTOP_PATH);
  const controlPanelLabel = language === 'ru' ? 'Панель управления' : 'Control Panel';
  const calculatorLabel = language === 'ru' ? 'Калькулятор' : 'Calculator';
  const paintLabel = 'Paint';
  const mediaPlayerLabel = 'Windows Media Player';
  const outlookLabel = 'Outlook Express';
  const internetLabel = 'Internet Explorer';
  const notepadLabel = language === 'ru' ? 'Блокнот' : 'Notepad';
  const projectsLabel = t.myProjects ?? 'My Projects';
  const gamesLabel = t.games ?? (language === 'ru' ? 'Игры' : 'Games');

  const renderShortcutIcon = (asset?: string, fallback?: string, altText = '') => (
    <img
      src={resolveAssetPath(asset, fallback ?? fallbackAssets.folderIcon)}
      alt={altText}
      className="w-12 h-12 drop-shadow"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  const applicationShortcuts: DesktopIcon[] = [
    { id: 'shortcut-internet-explorer', label: internetLabel, type: 'system', icon: renderShortcutIcon(themeAssets.internetExplorerIcon) },
    { id: 'shortcut-outlook', label: outlookLabel, type: 'system', icon: renderShortcutIcon(themeAssets.mailIcon) },
    { id: 'shortcut-media-player', label: mediaPlayerLabel, type: 'system', icon: renderShortcutIcon(themeAssets.mediaPlayerIcon) },
    { id: 'shortcut-projects-grid', label: projectsLabel, type: 'system', icon: renderShortcutIcon(themeAssets.projectsIcon) },
    { id: 'shortcut-calculator', label: calculatorLabel, type: 'system', icon: renderShortcutIcon(themeAssets.calculatorIcon) },
    { id: 'shortcut-paint', label: paintLabel, type: 'system', icon: renderShortcutIcon(themeAssets.paintIcon) },
    { id: 'shortcut-control-panel', label: controlPanelLabel, type: 'system', icon: renderShortcutIcon(themeAssets.controlPanelIcon) },
    { id: 'shortcut-pictures', label: picturesLabel, type: 'system', icon: renderShortcutIcon(themeAssets.folderIcon) },
    { id: 'shortcut-blog', label: blogLabel, type: 'system', icon: renderShortcutIcon(textDocumentIcon) },
    { id: 'shortcut-wiki', label: wikiLabel, type: 'system', icon: renderShortcutIcon(themeAssets.folderIcon) },
    { id: 'shortcut-notepad', label: notepadLabel, type: 'system', icon: renderShortcutIcon(themeAssets.notepadIcon ?? textDocumentIcon) },
    { id: 'shortcut-calendar', label: calendarLabel, type: 'system', icon: renderShortcutIcon(themeAssets.projectsIcon) },
    { id: 'shortcut-terminal', label: terminalLabel, type: 'system', icon: renderShortcutIcon(themeAssets.gamesIcon) },
    { id: 'shortcut-task-manager', label: taskManagerLabel, type: 'system', icon: renderShortcutIcon(themeAssets.controlPanelIcon) },
    { id: 'shortcut-about', label: aboutLabel, type: 'system', icon: renderShortcutIcon(themeAssets.folderIcon) },
  ];

  const initialDesktopIcons: DesktopIcon[] = [
    {
      id: 'my-computer',
      icon: getIconElement('computer'),
      label: t.myComputer,
      type: 'system'
    },
    {
      id: 'recycle-bin',
      icon: getIconElement('recycle'),
      label: t.recycleBin,
      type: 'system'
    },
    {
      id: 'minesweeper',
      icon: (
        <img
          src={resolveAssetPath(themeAssets.minesweeperIcon, fallbackAssets.minesweeperIcon)}
          alt="Minesweeper"
          className="w-12 h-12"
          onError={(e) => {
            e.currentTarget.src = resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon);
          }}
        />
      ),
      label: 'Minesweeper',
      type: 'system'
    },
    {
      id: 'games-folder',
      icon: (
        <img
          src={resolveAssetPath(
            themeAssets.gamesFolderIcon,
            fallbackAssets.gamesFolderIcon ?? themeAssets.gamesIcon
          )}
          alt={gamesLabel}
          className="w-12 h-12 drop-shadow"
          onError={(e) => {
            e.currentTarget.src = resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon);
          }}
        />
      ),
      label: gamesLabel,
      type: 'system'
    },
    ...applicationShortcuts,
    ...desktopItems.map(item => ({
      id: item.id,
      icon: item.icon && typeof item.icon === 'string' ? (
        <img
          src={item.icon}
          alt=""
          className={`w-12 h-12 ${item.name === 'Bliss.jpg' ? 'object-cover border-2 border-white shadow-md' : ''}`}
          onError={(e) => {
            e.currentTarget.src = item.type === 'folder'
              ? resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon)
              : textDocumentIcon;
          }}
        />
      ) : (
        <img
          src={item.type === 'folder'
            ? resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon)
            : textDocumentIcon}
          alt=""
          className="w-12 h-12"
        />
      ),
      label: item.name,
      type: (item.type === 'folder' ? 'folder' : 'system') as 'folder' | 'system'
    }))
  ];

  const taskbarHeight = 30;
  const iconSpacingY = 100;
  const iconSpacingX = 110;
  const baseOffsetX = 40;
  const baseOffsetY = 40;
  const availableHeight = Math.max(
    iconSpacingY,
    viewport.height - taskbarHeight - baseOffsetY * 2
  );
  const iconsPerColumn = Math.max(1, Math.floor(availableHeight / iconSpacingY));

  const desktopIcons: DesktopIcon[] = initialDesktopIcons.map((icon, index) => {
    const savedPosition = iconPositions[icon.id];
    if (savedPosition) {
      return { ...icon, x: savedPosition.x, y: savedPosition.y };
    }

    const columnIndex = Math.floor(index / iconsPerColumn);
    const rowIndex = index % iconsPerColumn;
    return {
      ...icon,
      x: baseOffsetX + columnIndex * iconSpacingX,
      y: baseOffsetY + rowIndex * iconSpacingY,
    };
  });

  if (!iconPositions['recycle-bin']) {
    const recycleIcon = desktopIcons.find((icon) => icon.id === 'recycle-bin');
    if (recycleIcon) {
      recycleIcon.x = Math.max(baseOffsetX, viewport.width - baseOffsetX - 72);
      recycleIcon.y = Math.max(baseOffsetY, viewport.height - taskbarHeight - baseOffsetY - 72);
    }
  }

  const updateSelectionFromBox = useCallback(
    (box: { left: number; top: number; width: number; height: number }) => {
      if (!desktopRef.current) return;
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const selectionLeft = box.left;
      const selectionTop = box.top;
      const selectionRight = selectionLeft + box.width;
      const selectionBottom = selectionTop + box.height;

      const newlySelected: string[] = [];

      desktopIcons.forEach((icon) => {
        const node = iconRefs.current[icon.id];
        if (!node) return;
        const nodeRect = node.getBoundingClientRect();
        const iconLeft = nodeRect.left - desktopRect.left;
        const iconTop = nodeRect.top - desktopRect.top;
        const iconRight = nodeRect.right - desktopRect.left;
        const iconBottom = nodeRect.bottom - desktopRect.top;

        const intersects =
          iconLeft < selectionRight &&
          iconRight > selectionLeft &&
          iconTop < selectionBottom &&
          iconBottom > selectionTop;

        if (intersects) {
          newlySelected.push(icon.id);
        }
      });

      setSelectedIcons((prev) => {
        if (prev.length === newlySelected.length && prev.every((id) => newlySelected.includes(id))) {
          return prev;
        }
        return newlySelected;
      });
    },
    [desktopIcons]
  );

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!desktopRef.current) return;
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const currentX = event.clientX - desktopRect.left;
      const currentY = event.clientY - desktopRect.top;
      const startPoint = selectionStartRef.current!;
      const startX = startPoint.x;
      const startY = startPoint.y;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      const box = { left, top, width, height };
      setSelectionBox(box);
      updateSelectionFromBox(box);
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setSelectionBox(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, updateSelectionFromBox]);

  const handleDesktopMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (!desktopRef.current) return;

    closeStartMenu();
    if (event.target === desktopRef.current) {
      const desktopRect = desktopRef.current.getBoundingClientRect();
      const startX = event.clientX - desktopRect.left;
      const startY = event.clientY - desktopRect.top;
      selectionStartRef.current = { x: startX, y: startY };
      setIsSelecting(true);
      setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
      setSelectedIcons([]);
    }
  };

  const handleOpenFile = useCallback(async (item: FileSystemItem, parentPath: string) => {
    const fullPath = joinWindowsPath(parentPath, item.name);
    let content: React.ReactNode | null = null;
    let title = item.name;
    let width = 640;
    let height = 480;

    if (item.id === 'about-me') {
      content = <MyCV />;
      title = 'My CV';
      width = 720;
      height = 540;
    }

    const lowerName = item.name.toLowerCase();
    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      let fileContent = item.content || '';

      // If content is a path to markdown file, load it dynamically
      if (typeof fileContent === 'string' && fileContent.endsWith('.md') && !fileContent.includes('\n')) {
        try {
          const markdownContent = await loadMarkdownContent(fileContent);
          fileContent = markdownContent;
        } catch (error) {
          console.warn('Failed to load markdown content:', error);
          fileContent = `Failed to load ${fileContent}`;
        }
      }

      content = <Notepad initialContent={fileContent} />;
      title = `${item.name} - Notepad`;
    } else if (/\.(png|jpg|jpeg|gif)$/i.test(lowerName)) {
      if (typeof item.content === 'string') {
        content = <PictureViewer initialImage={item.content} />;
        title = `${item.name} - Picture Viewer`;
      }
    }

    if (!content) {
      playErrorSound();
      return;
    }

    const iconPath = getFileIcon(item);

    openWindow({
      id: `file:${fullPath}`,
      title,
      content,
      icon: typeof iconPath === 'string' ? iconPath : undefined,
      width,
      height,
    });
    playLaunchSound();
  }, [openWindow, playErrorSound, playLaunchSound]);

  const openExplorerWindow = useCallback((path: string) => {
    const normalizedPath = path || 'My Computer';
    const title =
      normalizedPath === 'My Computer'
        ? t.myComputer
        : normalizedPath.split('\\').filter(Boolean).pop() || normalizedPath;

    openWindow({
      id: `explorer:${normalizedPath}`,
      title,
      icon: normalizedPath === 'My Computer' ? themeAssets.computerIcon : themeAssets.folderIcon,
      width: 720,
      height: 520,
      content: (
        <MyComputer
          currentPath={normalizedPath}
          onOpenItem={handleOpenFile}
        />
      ),
    });
    playLaunchSound();
  }, [handleOpenFile, openWindow, playLaunchSound, t.myComputer, themeAssets.computerIcon, themeAssets.folderIcon]);

  const launchMinesweeper = useCallback(() => {
    openWindow({
      id: MINESWEEPER_WINDOW_ID,
      title: 'Minesweeper',
      icon: themeAssets.minesweeperIcon ?? minesweeperIcon,
      width: 360,
      height: 480,
      resizable: false,
      content: <Minesweeper onClose={() => closeWindow(MINESWEEPER_WINDOW_ID)} />,
    });
    playLaunchSound();
  }, [closeWindow, openWindow, playLaunchSound, themeAssets.minesweeperIcon]);

  const openInternetExplorerApp = useCallback(() => {
    openWindow({
      id: 'app:internet-explorer',
      title: 'Internet Explorer',
      icon: resolveAssetPath(themeAssets.internetExplorerIcon, fallbackAssets.internetExplorerIcon),
      width: 960,
      height: 640,
      content: <InternetExplorer />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.internetExplorerIcon, fallbackAssets.internetExplorerIcon]);

  const openOutlookExpressApp = useCallback(() => {
    openWindow({
      id: 'app:outlook',
      title: 'Outlook Express',
      icon: resolveAssetPath(themeAssets.mailIcon, fallbackAssets.mailIcon),
      width: 860,
      height: 560,
      content: <OutlookExpress />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.mailIcon, fallbackAssets.mailIcon]);

  const openWindowsMediaPlayerApp = useCallback(() => {
    openWindow({
      id: 'app:windows-media-player',
      title: 'Windows Media Player',
      icon: resolveAssetPath(themeAssets.mediaPlayerIcon, fallbackAssets.mediaPlayerIcon),
      width: 400,
      height: 580,
      resizable: false,
      content: <WindowsMediaPlayer />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.mediaPlayerIcon, fallbackAssets.mediaPlayerIcon]);

  const openDoomVariant = useCallback((variantId: DoomVariantId) => {
    const variant = doomVariantMap[variantId];
    if (!variant) {
      playErrorSound();
      return;
    }

    openWindow({
      id: `app:doom-${variantId}`,
      title: variant.title,
      icon: variant.icon,
      width: variant.window.width,
      height: variant.window.height,
      content: <DoomPlayer variantId={variantId} />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, playErrorSound]);

  const openGamesFolder = useCallback(() => {
    openWindow({
      id: 'app:games-folder',
      title: gamesLabel,
      icon: resolveAssetPath(
        themeAssets.gamesFolderIcon,
        fallbackAssets.gamesFolderIcon ?? themeAssets.gamesIcon
      ),
      width: 820,
      height: 560,
      content: <GamesFolder onLaunch={openDoomVariant} />,
    });
    playLaunchSound();
  }, [
    fallbackAssets.gamesFolderIcon,
    fallbackAssets.gamesIcon,
    gamesLabel,
    openDoomVariant,
    openWindow,
    playLaunchSound,
    themeAssets.gamesFolderIcon,
    themeAssets.gamesIcon,
  ]);

  const openCalculatorApp = useCallback(() => {
    openWindow({
      id: 'app:calculator',
      title: 'Calculator',
      icon: resolveAssetPath(themeAssets.calculatorIcon, fallbackAssets.calculatorIcon),
      width: 320,
      height: 400,
      resizable: false,
      content: <Calculator />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.calculatorIcon, fallbackAssets.calculatorIcon]);

  const openPaintApp = useCallback(() => {
    openWindow({
      id: 'app:paint',
      title: 'Paint',
      icon: resolveAssetPath(themeAssets.paintIcon, fallbackAssets.paintIcon),
      width: 900,
      height: 700,
      content: <Paint />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.paintIcon, fallbackAssets.paintIcon]);

  const openControlPanelApp = useCallback(() => {
    openWindow({
      id: 'app:control-panel',
      title: 'Control Panel',
      icon: resolveAssetPath(themeAssets.controlPanelIcon, fallbackAssets.controlPanelIcon),
      width: 760,
      height: 600,
      content: <ControlPanel />,
    });
    playLaunchSound();
  }, [openWindow, playLaunchSound, themeAssets.controlPanelIcon, fallbackAssets.controlPanelIcon]);

  const openNotepadApp = useCallback(() => {
    openWindow({
      id: `app:notepad-${Date.now()}`,
      title: `${notepadLabel}`,
      icon: textDocumentIcon,
      width: 640,
      height: 480,
      content: <Notepad initialContent="" />,
    });
    playLaunchSound();
  }, [notepadLabel, openWindow, playLaunchSound, textDocumentIcon]);

  const handleOpenPictureFromGallery = useCallback((imagePath: string) => {
    openWindow({
      id: `picture:${imagePath}`,
      title: imagePath.split('/').pop() || 'Picture',
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 720,
      height: 520,
      content: <PictureViewer initialImage={imagePath} />,
    });
  }, [openWindow, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const openPicturesApp = useCallback(() => {
    openWindow({
      id: 'app:pictures',
      title: picturesLabel,
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 960,
      height: 620,
      content: <PicturesGallery onOpenImage={handleOpenPictureFromGallery} />,
    });
    playLaunchSound();
  }, [handleOpenPictureFromGallery, openWindow, playLaunchSound, picturesLabel, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const openBlogApp = useCallback(() => {
    openWindow({
      id: 'app:blog',
      title: blogLabel,
      icon: textDocumentIcon,
      width: 960,
      height: 640,
      content: <BlogApp />,
    });
    playLaunchSound();
  }, [blogLabel, openWindow, playLaunchSound, textDocumentIcon]);

  const openWikiApp = useCallback(() => {
    openWindow({
      id: 'app:wiki',
      title: wikiLabel,
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 960,
      height: 640,
      content: <WikiApp />,
    });
    playLaunchSound();
  }, [wikiLabel, openWindow, playLaunchSound, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const openCalendarApp = useCallback(() => {
    openWindow({
      id: 'app:calendar',
      title: calendarLabel,
      icon: resolveAssetPath(themeAssets.projectsIcon, fallbackAssets.projectsIcon),
      width: 840,
      height: 600,
      content: <CalendarApp />,
    });
    playLaunchSound();
  }, [calendarLabel, openWindow, playLaunchSound, themeAssets.projectsIcon, fallbackAssets.projectsIcon]);

  const openProjectsGrid = useCallback(() => {
    openWindow({
      id: 'app:projects-grid',
      title: projectsLabel,
      icon: resolveAssetPath(themeAssets.projectsIcon, fallbackAssets.projectsIcon),
      width: 820,
      height: 560,
      content: <ProjectsGrid />,
    });
    playLaunchSound();
  }, [projectsLabel, openWindow, playLaunchSound, themeAssets.projectsIcon, fallbackAssets.projectsIcon]);

  const openTerminalApp = useCallback(() => {
    openWindow({
      id: 'app:terminal',
      title: terminalLabel,
      icon: resolveAssetPath(themeAssets.gamesIcon, fallbackAssets.gamesIcon),
      width: 760,
      height: 480,
      content: <Terminal />,
    });
    playLaunchSound();
  }, [terminalLabel, openWindow, playLaunchSound, themeAssets.gamesIcon, fallbackAssets.gamesIcon]);

  const openAboutApp = useCallback(() => {
    openWindow({
      id: 'app:about',
      title: aboutLabel,
      icon: resolveAssetPath(themeAssets.folderIcon, fallbackAssets.folderIcon),
      width: 720,
      height: 520,
      content: <AboutApp />,
    });
    playLaunchSound();
  }, [aboutLabel, openWindow, playLaunchSound, themeAssets.folderIcon, fallbackAssets.folderIcon]);

  const openTaskManagerApp = useCallback(() => {
    setShowTaskManager(true);
    playLaunchSound();
  }, [playLaunchSound]);

  const handleRunCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    
    const commandMap: Record<string, () => void> = {
      notepad: openNotepadApp,
      calc: openCalculatorApp,
      calculator: openCalculatorApp,
      mspaint: openPaintApp,
      paint: openPaintApp,
      control: openControlPanelApp,
      iexplore: openInternetExplorerApp,
      winmine: launchMinesweeper,
      minesweeper: launchMinesweeper,
      pictures: openPicturesApp,
      pics: openPicturesApp,
      blog: openBlogApp,
      wiki: openWikiApp,
      calendar: openCalendarApp,
      terminal: openTerminalApp,
      taskmgr: openTaskManagerApp,
      taskmanager: openTaskManagerApp,
      projects: openProjectsGrid,
      games: openGamesFolder,
      doom1: () => openDoomVariant('doom1'),
      doom2: () => openDoomVariant('doom2'),
      doom3: () => openDoomVariant('doom3'),
    };

    const handler = commandMap[lowerCommand];
    if (handler) {
      handler();
      playLaunchSound();
    } else {
      playErrorSound();
      setErrorWindow({
        id: `error-run-${Date.now()}`,
        message: `Windows cannot find '${command}'. Make sure you typed the name correctly, and then try again.`
      });
    }
  }, [
    openNotepadApp,
    openWindow,
    openCalculatorApp,
    openPaintApp,
    openControlPanelApp,
    openInternetExplorerApp,
    openPicturesApp,
    openBlogApp,
    openWikiApp,
    openCalendarApp,
    openTerminalApp,
    openTaskManagerApp,
    launchMinesweeper,
    playLaunchSound,
    playErrorSound,
    themeAssets.folderIcon,
    openGamesFolder,
    openDoomVariant,
    openProjectsGrid,
  ]);

  const launchApp = useCallback((appId: string) => {
    switch (appId) {
      case 'minesweeper':
        launchMinesweeper();
        break;
      case 'my-computer':
        openExplorerWindow('My Computer');
        break;
      case 'internet-explorer':
        openInternetExplorerApp();
        break;
      case 'outlook':
        openOutlookExpressApp();
        break;
      case 'windows-media-player':
        openWindowsMediaPlayerApp();
        break;
      case 'games-folder':
        openGamesFolder();
        break;
      case 'doom1':
      case 'doom2':
      case 'doom3':
        openDoomVariant(appId as DoomVariantId);
        break;
      case 'calculator':
        openCalculatorApp();
        break;
      case 'paint':
        openPaintApp();
        break;
      case 'control-panel':
        openControlPanelApp();
        break;
      case 'pictures':
        openPicturesApp();
        break;
      case 'projects-grid':
        openProjectsGrid();
        break;
      case 'blog':
        openBlogApp();
        break;
      case 'wiki':
        openWikiApp();
        break;
      case 'calendar':
        openCalendarApp();
        break;
      case 'terminal':
        openTerminalApp();
        break;
      case 'task-manager':
        openTaskManagerApp();
        break;
      case 'notepad':
        openNotepadApp();
        break;
      case 'about':
        openAboutApp();
        break;
      case 'all-programs':
        openExplorerWindow('C:\\Program Files');
        break;
      default:
        playErrorSound();
        setErrorWindow({
          id: `error-${Date.now()}`,
          message: `Windows cannot find '${appId.replace('unavailable:', '')}'. Make sure you typed the name correctly, and then try again.`,
        });
        console.warn(`[StartMenu] Unknown app requested: ${appId}`);
    }
  }, [
    launchMinesweeper,
    openExplorerWindow,
    openInternetExplorerApp,
    openOutlookExpressApp,
    openWindowsMediaPlayerApp,
    openGamesFolder,
    openDoomVariant,
    openCalculatorApp,
    openPaintApp,
    openControlPanelApp,
    openPicturesApp,
    openProjectsGrid,
    openBlogApp,
    openWikiApp,
    openCalendarApp,
    openTerminalApp,
    openTaskManagerApp,
    openNotepadApp,
    openAboutApp,
    playErrorSound,
  ]);

  const openPathFromMenu = useCallback((path: string) => {
    openExplorerWindow(path);
  }, [openExplorerWindow]);

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    switch (icon.id) {
      case 'my-computer':
        openExplorerWindow('My Computer');
        return;
      case 'recycle-bin':
        playErrorSound();
        setErrorWindow({
          id: `error-${Date.now()}`,
          message: `C:\\\nApplication not found`
        });
        return;
      case 'minesweeper':
        launchMinesweeper();
        return;
      case 'shortcut-internet-explorer':
        openInternetExplorerApp();
        return;
      case 'shortcut-outlook':
        openOutlookExpressApp();
        return;
      case 'shortcut-media-player':
        openWindowsMediaPlayerApp();
        return;
      case 'games-folder':
        openGamesFolder();
        return;
      case 'shortcut-calculator':
        openCalculatorApp();
        return;
      case 'shortcut-paint':
        openPaintApp();
        return;
      case 'shortcut-control-panel':
        openControlPanelApp();
        return;
      case 'shortcut-pictures':
        openPicturesApp();
        return;
      case 'shortcut-projects-grid':
        openProjectsGrid();
        return;
      case 'shortcut-blog':
        openBlogApp();
        return;
      case 'shortcut-wiki':
        openWikiApp();
        return;
      case 'shortcut-notepad':
        openNotepadApp();
        return;
      case 'shortcut-calendar':
        openCalendarApp();
        return;
      case 'shortcut-terminal':
        openTerminalApp();
        return;
      case 'shortcut-task-manager':
        openTaskManagerApp();
        return;
      case 'shortcut-about':
        openAboutApp();
        return;
      default:
        {
          const item = desktopItems.find(i => i.id === icon.id);
          if (!item) return;
          if (item.type === 'folder') {
            openExplorerWindow(joinWindowsPath(DESKTOP_PATH, item.name));
          } else if (item.type === 'file') {
            handleOpenFile(item, DESKTOP_PATH);
          }
        }
    }
  };

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon || icon.x === undefined || icon.y === undefined) return;

    if (e.button === 0) {
      if (e.ctrlKey) {
        setSelectedIcons((prev) => {
          if (prev.includes(iconId)) {
            return prev.filter((id) => id !== iconId);
          }
          return [...prev, iconId];
        });
      } else if (!selectedIcons.includes(iconId)) {
        setSelectedIcons([iconId]);
      }
    } else if (!selectedIcons.includes(iconId)) {
      setSelectedIcons((prev) => {
        if (prev.includes(iconId)) {
          return prev.filter((id) => id !== iconId);
        }
        return [...prev, iconId];
      });
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggingIcon(iconId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingIcon || !desktopRef.current) return;

      const desktopRect = desktopRef.current.getBoundingClientRect();
      const newX = e.clientX - desktopRect.left - dragOffset.x;
      const newY = e.clientY - desktopRect.top - dragOffset.y;

      setIconPositions(prev => ({
        ...prev,
        [draggingIcon]: {
          x: Math.max(0, Math.min(newX, desktopRect.width - 100)),
          y: Math.max(0, Math.min(newY, desktopRect.height - 100)),
        }
      }));
    };

    const handleMouseUp = () => {
      setDraggingIcon(null);
    };

    if (draggingIcon) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingIcon, dragOffset]);

  const handleCloseWindow = (id: string) => {
    playCloseWindowSound();
    closeWindow(id);
  };

  const handleMinimizeWindow = (id: string) => {
    playMinimizeSound();
    minimizeWindow(id);
  };

  const handleMaximizeWindow = (id: string) => {
    maximizeWindow(id);
  };

  const handleRestoreWindow = (id: string) => {
    playRestoreSound();
    restoreWindow(id);
  };

  const handleFocusWindow = (id: string) => {
    focusWindow(id);
  };

  return (
    <div
      ref={desktopRef}
      className={`${themeStyles.body.join(' ')} min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden`}
      style={{
        backgroundImage: isXpFamily && themeAssets.wallpaper
          ? `url(${themeAssets.wallpaper})`
          : undefined,
        backgroundColor: isXpFamily ? 'transparent' : '#008080',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom: '30px'
      }}
      onMouseDown={handleDesktopMouseDown}
      onClick={(event) => {
        closeStartMenu();
        setContextMenu(null);
        if (desktopRef.current && event.target === desktopRef.current) {
          setSelectedIcons([]);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        closeStartMenu();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
            {
              label: 'Arrange Icons By', submenu: [
                { label: 'Name' },
                { label: 'Size' },
                { label: 'Type' },
                { label: 'Modified' },
                { separator: true },
                { label: 'Auto Arrange' },
                { label: 'Align to Grid' },
              ]
            },
            { label: 'Refresh', onClick: () => { } },
            { separator: true },
            { label: 'Paste', disabled: true },
            { separator: true },
            {
              label: 'New', submenu: [
                { label: 'Folder' },
                { label: 'Shortcut' },
                { separator: true },
                { label: 'Text Document' },
              ]
            },
            { label: 'Properties' },
          ],
        });
      }}
    >
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute cursor-pointer group"
          style={{
            left: `${icon.x}px`,
            top: `${icon.y}px`,
            width: '96px',
            zIndex: draggingIcon === icon.id ? 1000 : 1,
          }}
          ref={(element) => {
            iconRefs.current[icon.id] = element;
          }}
          data-icon-id={icon.id}
          onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!selectedIcons.includes(icon.id)) {
              setSelectedIcons([icon.id]);
            }
            closeStartMenu();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: [
                { label: 'Open', onClick: () => handleIconDoubleClick(icon) },
                { separator: true },
                { label: 'Cut', disabled: true },
                { label: 'Copy', disabled: true },
                { separator: true },
                { label: 'Create Shortcut', disabled: true },
                { label: 'Delete', disabled: true },
                { label: 'Rename', disabled: true },
                { separator: true },
                { label: 'Properties', disabled: true },
              ],
            });
          }}
        >
          <div
            className={`p-2 rounded flex flex-col items-center justify-center ${
              isXpFamily
                ? selectedIcons.includes(icon.id)
                  ? 'bg-blue-600/40'
                  : 'group-hover:bg-blue-500/30'
                : selectedIcons.includes(icon.id)
                  ? 'bg-blue-800/40 border border-gray-200'
                  : 'group-hover:bg-blue-800/50 border border-transparent group-hover:border-gray-300'
            } transition-colors ${draggingIcon === icon.id ? 'opacity-80' : ''}`}
          >
            <div className={`flex items-center justify-center ${!isXpFamily && 'opacity-90'}`} style={{ textShadow: isXpFamily ? '0 1px 1px rgba(0,0,0,0.5)' : 'none' }}>
              {icon.icon}
            </div>
            <div className={`text-white text-[11px] text-center mt-1 w-full break-words ${isXpFamily ? 'drop-shadow-lg font-semibold' : ''}`} style={{
              textShadow: isXpFamily ? '0 1px 1px rgba(0,0,0,0.8)' : 'none',
              lineHeight: '1.2'
            }}>
              {icon.label}
            </div>
          </div>
        </div>
      ))}

      {selectionBox && (
        <div
          className="absolute border border-[#1d5fbf] bg-[#75a9ff55] pointer-events-none"
          style={{
            left: `${selectionBox.left}px`,
            top: `${selectionBox.top}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
          }}
        />
      )}

      {windows.map((window) => {
        return (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            initialX={window.x}
            initialY={window.y}
            width={window.width}
            height={window.height}
            minimized={window.minimized}
            maximized={window.maximized}
            zIndex={window.zIndex}
            focused={window.focused}
            onClose={() => handleCloseWindow(window.id)}
            onMinimize={() => handleMinimizeWindow(window.id)}
            onMaximize={() => handleMaximizeWindow(window.id)}
            onRestore={() => handleRestoreWindow(window.id)}
            onFocus={() => handleFocusWindow(window.id)}
            onDragEnd={(position) => updateWindow(window.id, position)}
            onResizeEnd={(size) => updateWindow(window.id, size)}
          >
            {window.content}
          </Window>
        );
      })}

      {
        errorWindow && (
          <Window
            key={errorWindow.id}
            id={errorWindow.id}
            title="C:\\"
            initialX={window.innerWidth / 2 - 190}
            initialY={window.innerHeight / 2 - 60}
            onClose={() => setErrorWindow(null)}
            width={380}
            height={135}
            minimized={false}
            maximized={false}
            zIndex={1000}
            focused={true}
          >
            <ErrorBox
              message={errorWindow.message}
              onClose={() => setErrorWindow(null)}
            />
          </Window>
        )
      }

      {/* Taskbar */}
      <div
        className={`taskbar fixed bottom-0 left-0 right-0 flex items-center justify-start shadow-lg z-50 ${themeStyles.taskbar.join(' ')}`}
      >
        <div className="taskbar__inner">
          {/* Start Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (showStartMenu) {
                closeStartMenu();
              } else {
                openStartMenu();
              }
            }}
            className={`start-button flex items-center gap-1 h-full relative ${(showStartMenu ? themeStyles.startButtonOpen : themeStyles.startButton).join(' ')}`}
          >
            {isXpFamily ? (
              <>
                {themeAssets.startButtonIcon && (
                  <img
                    src={themeAssets.startButtonIcon}
                    alt="Windows"
                    className="start-button__icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="start-button__label">
                  {startLabel}
                </span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 bg-black">
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-yellow-500"></div>
                </div>
                <span className="text-black font-bold text-sm">{t.start ?? 'Start'}</span>
              </>
            )}
          </button>

          {/* Window List Area */}
          <div className="taskbar-windows flex-1 overflow-hidden">
            {windows.map((window) => (
              <button
                key={window.id}
                onClick={() => {
                  if (window.focused) {
                    handleMinimizeWindow(window.id);
                  } else if (window.minimized) {
                    handleRestoreWindow(window.id);
                  } else {
                    handleFocusWindow(window.id);
                  }
                }}
                className={`taskbar-button flex-shrink-0 truncate max-w-[170px] select-none ${window.focused ? 'is-active' : ''} ${window.minimized ? 'is-minimized' : ''}`}
                title={window.title}
              >
                {window.icon && (
                  <img
                    src={window.icon}
                    alt=""
                    className="taskbar-button__icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="taskbar-button__label">{window.title}</span>
              </button>
            ))}
          </div>

          <div className="taskbar-divider" aria-hidden />

          <div className="taskbar-lang">
            <LangSwitcher variant="tray" buttonClassName="taskbar-tray-icon taskbar-lang-button" />
          </div>

          {/* Notification Tray / Clock */}
          <div ref={trayRef} className={`taskbar-tray ${themeStyles.systemTray.join(' ')}`}>
          <button
            onClick={toggleFullscreen}
            className="taskbar-tray-icon"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullscreenIconSrc && (
              <img src={fullscreenIconSrc} alt="fullscreen" className="w-4 h-4" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={handleVolumeToggle}
              className="taskbar-tray-icon"
              title="Volume"
            >
              <img
                src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
                alt="volume"
                className="w-4 h-4"
              />
            </button>
            {showVolumePanel && (
              <div className="absolute right-0 bottom-full mb-2 w-32 rounded-lg border border-[#90aee6] bg-[#fefefe] px-3 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] flex items-center gap-3">
                <img
                  src={volumeLevel === 0 ? muteIconSrc : volumeIconSrc}
                  alt="Volume icon"
                  className="volume-panel__icon"
                />
                <div className="volume-slider-wrapper">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volumeLevel}
                    orient="vertical"
                    onChange={(e) => setVolumeLevel(Number(e.currentTarget.value))}
                    className="volume-slider"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={handleNotificationToggle}
              className="taskbar-tray-icon"
              title="Notifications"
            >
              {notificationIconSrc && (
                <img src={notificationIconSrc} alt="notifications" className="w-4 h-4" />
              )}
            </button>
            {showNotificationPanel && (
              <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-[#90aee6] bg-[#fefefe] px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.35)] text-[11px] text-[#1b1b1b]">
                No new notifications
              </div>
            )}
          </div>

          {/* Tray Expansion Slider */}
          {isXpFamily && themeAssets.trayExpandIcon && (
            <button
              className="taskbar-tray-icon taskbar-tray-icon--compact"
              title="Show hidden icons"
            >
              <img src={themeAssets.trayExpandIcon} alt="" className="w-3 h-3" />
            </button>
          )}

          {/* Clock */}
          <div className="taskbar-tray-time">
            <span
              className="text-[11px] font-semibold tracking-wide uppercase"
              style={{ textShadow: '0 1px 0 rgba(0,0,0,0.4)', letterSpacing: '0.05em' }}
            >
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          </div>
        </div>
      </div>

      {
        showStartMenu && (
          <div onClick={(e) => e.stopPropagation()}>
            <StartMenu
              onClose={closeStartMenu}
              onLaunchApp={launchApp}
              onOpenPath={openPathFromMenu}
              onSystemCommand={(command) => {
                handleSystemCommand(command);
              }}
              onHover={handleMenuHoverSound}
            />
          </div>
        )
      }

      {
        contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={() => setContextMenu(null)}
          />
        )
      }

      {showRunDialog && (
        <RunDialog
          onClose={() => setShowRunDialog(false)}
          onRun={handleRunCommand}
        />
      )}

      {showTaskManager && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40" onClick={() => setShowTaskManager(false)}>
          <div className="w-[600px] h-[500px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-full flex flex-col">
              <div className={`${isXpFamily ? 'bg-gradient-to-r from-[#0054e3] to-[#0a5fef]' : 'bg-gradient-to-r from-[#000080] to-[#1084d0]'} text-white px-2 py-1 flex justify-between`}>
                <span className="text-sm font-bold">Windows Task Manager</span>
                <button onClick={() => setShowTaskManager(false)} className="text-white hover:bg-white/20 px-2">×</button>
              </div>
              <div className="flex-1">
                <TaskManager 
                  windows={windows.map(w => ({ id: w.id, title: w.title }))} 
                  onEndTask={(id) => {
                    handleCloseWindow(id);
                    if (windows.length <= 1) {
                      setShowTaskManager(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}
