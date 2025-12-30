import { useApp } from '../../contexts/AppContext';
import { translations } from '../../i18n/translations';
import { Power, Settings, HelpCircle, Search, FileText, ChevronsRight } from 'lucide-react';
import { THEME_ASSETS, ThemeAssetId } from './themeAssets';

export interface StartMenuXPProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  appearance?: 'webos' | 'win-xp';
  onHover?: () => void;
}

type MenuItem = {
  id: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  appId?: string;
  path?: string;
  url?: string;
  disabled?: boolean;
  isSeparator?: boolean;
};

type PrimaryShortcut = MenuItem & { tag: string };

const MY_DOCUMENTS_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents';
const MY_DESKTOP_PATH = 'C:\\Documents and Settings\\C4m1r\\Desktop';
const MY_PICTURES_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Pictures';
const MY_MUSIC_PATH = 'C:\\Documents and Settings\\C4m1r\\My Documents\\My Music';

export function StartMenuXP({ onClose, onLaunchApp, onOpenPath, onSystemCommand, appearance = 'webos', onHover }: StartMenuXPProps) {
  const { language, theme } = useApp();
  const t = translations[language].xp;
  const currentTheme = theme as ThemeAssetId;
  const themeAssets = THEME_ASSETS[currentTheme] ?? THEME_ASSETS.webos;
  const startMenuIcons = themeAssets.startMenuIcons;
  const placeIcons = themeAssets.placesIcons ?? {};
  const userAvatar = themeAssets.userAvatar;
  const fallbackIcon = themeAssets.folderIcon ?? themeAssets.projectsIcon;
  const handleHover = () => {
    onHover?.();
  };

  const primaryShortcuts: PrimaryShortcut[] = [
    {
      id: 'primary-internet',
      title: 'Internet Explorer',
      icon: startMenuIcons.internetExplorer ?? themeAssets.internetExplorerIcon,
      appId: 'internet-explorer',
      tag: t.internet ?? 'Internet',
    },
    {
      id: 'primary-email',
      title: 'Outlook Express',
      icon: startMenuIcons.outlook ?? themeAssets.mailIcon,
      appId: 'outlook',
      tag: t.email ?? 'E-mail',
    },
  ];

  const gamesTitle = t.games ?? 'Games';

  const pinnedPrograms: MenuItem[] = [
    {
      id: 'windows-media-player',
      title: 'Windows Media Player',
      icon: startMenuIcons.windowsMediaPlayer ?? themeAssets.mediaPlayerIcon,
      appId: 'windows-media-player',
    },
    {
      id: 'projects-grid',
      title: t.myProjects ?? 'My Projects',
      icon: startMenuIcons.projects ?? themeAssets.projectsIcon ?? fallbackIcon,
      appId: 'projects-grid',
    },
    {
      id: 'paint',
      title: 'Paint',
      icon: startMenuIcons.paint ?? themeAssets.paintIcon ?? themeAssets.folderIcon,
      appId: 'paint',
    },
  ];

  const frequentPrograms: MenuItem[] = [
    {
      id: 'games-folder',
      title: gamesTitle,
      icon: themeAssets.gamesFolderIcon ?? startMenuIcons.games ?? themeAssets.gamesIcon,
      appId: 'games-folder',
    },
    {
      id: 'calculator',
      title: 'Calculator',
      icon: startMenuIcons.calculator ?? themeAssets.calculatorIcon ?? themeAssets.folderIcon,
      appId: 'calculator',
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      icon: startMenuIcons.minesweeper ?? themeAssets.minesweeperIcon,
      appId: 'minesweeper',
    },
    {
      id: 'my-computer',
      title: t.myComputer,
      icon: themeAssets.computerIcon ?? fallbackIcon,
      appId: 'my-computer',
    },
  ];

  const placesLinks: MenuItem[] = [
    {
      id: 'my-documents',
      title: t.myDocuments,
      icon: placeIcons.myDocuments ?? themeAssets.folderIcon,
      path: MY_DOCUMENTS_PATH,
    },
    {
      id: 'recent-documents',
      title: 'My Recent Documents',
      icon: placeIcons.recentDocuments ?? themeAssets.folderIcon,
      path: MY_DESKTOP_PATH,
    },
    {
      id: 'my-pictures',
      title: 'My Pictures',
      icon: placeIcons.myPictures ?? themeAssets.folderIcon,
      path: MY_PICTURES_PATH,
    },
    {
      id: 'my-music',
      title: 'My Music',
      icon: placeIcons.myMusic ?? themeAssets.folderIcon,
      path: MY_MUSIC_PATH,
    },
    {
      id: 'my-computer',
      title: t.myComputer,
      icon: placeIcons.myComputer ?? themeAssets.computerIcon,
      appId: 'my-computer',
    },
    {
      id: 'control-panel',
      title: 'Control Panel',
      icon: placeIcons.controlPanel ?? fallbackIcon,
      appId: 'control-panel',
    },
    {
      id: 'program-access',
      title: 'Set Program Access and Defaults',
      icon: placeIcons.programAccess ?? fallbackIcon,
      appId: 'unavailable:Program Access',
      disabled: true,
    },
    {
      id: 'connect-to',
      title: 'Connect To',
      icon: placeIcons.connectTo ?? fallbackIcon,
      appId: 'unavailable:Connect To',
      disabled: true,
    },
    {
      id: 'printers',
      title: 'Printers and Faxes',
      icon: placeIcons.printers ?? fallbackIcon,
      appId: 'unavailable:Printers and Faxes',
      disabled: true,
    },
    { id: 'separator-places', isSeparator: true },
    {
      id: 'help',
      title: 'Help and Support',
      icon: placeIcons.help ?? undefined,
      appId: 'unavailable:Help',
      disabled: true,
    },
    {
      id: 'search',
      title: 'Search',
      icon: placeIcons.search ?? undefined,
      appId: 'unavailable:Search',
      disabled: true,
    },
    {
      id: 'run',
      title: 'Run...',
      icon: placeIcons.run ?? undefined,
      appId: 'unavailable:Run',
      disabled: true,
    },
  ];

  const frequentLabel = t.frequentPrograms ?? 'Frequently used programs';
  const allProgramsLabel = t.allPrograms ?? 'All Programs';
  const logOffLabel = t.logOff ?? 'Log Off';
  const turnOffLabel = t.turnOff ?? 'Turn Off Computer';

  const handleMenuAction = (entry: MenuItem) => {
    if (entry.disabled) {
      onLaunchApp?.(`unavailable:${entry.title ?? entry.id}`);
      onClose();
      return;
    }
    if (entry.appId) {
      onLaunchApp?.(entry.appId);
      onClose();
      return;
    }
    if (entry.path) {
      onOpenPath?.(entry.path);
      onClose();
      return;
    }
    if (entry.url) {
      window.open(entry.url, '_blank', 'noreferrer');
      onClose();
      return;
    }
    onLaunchApp?.(`unavailable:${entry.title ?? entry.id}`);
    onClose();
  };

  return (
    <section
      className={`fixed z-[99999] left-0 min-w-[380px] min-h-[494px] flex flex-col start-menu-modern start-menu-${appearance}`}
      style={{
        bottom: '30px',
        filter: 'drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.4))',
        borderStyle: 'solid',
        borderColor: '#3e74cd #1854c2',
        borderWidth: '1px 1px 0',
        borderRadius: '7px 7px 0 0',
        overflow: 'hidden',
        boxShadow: 'inset -20px 0px 4px -19px #1854c2',
        pointerEvents: 'auto',
        animation: 'slideUpFade 150ms ease-out',
      }}
    >
      {/* Header - based on winXPReact-master FooterMenu.js */}
      <header
        className="relative flex items-center text-white start-menu__header"
        style={{
          height: '60px',
          padding: '8px',
          width: '100%',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          background: 'linear-gradient(to bottom, #245EDC 0%, #3F8CF3 7%, #245EDC 50%, #1941A5 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Top highlight line */}
        <div
          className="absolute top-[1px] left-0 w-full h-[3px]"
          style={{
            background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.3) 1%, rgba(255, 255, 255, 0.5) 2%, rgba(255, 255, 255, 0.5) 95%, rgba(255, 255, 255, 0.3) 98%, rgba(255, 255, 255, 0.2) 99%, transparent 100%)',
            boxShadow: 'inset 0 -1px 1px #0e60cb',
          }}
        />
        {userAvatar && (
          <img
            src={userAvatar}
            alt="User"
            className="w-[42px] h-[42px] mr-[5px] rounded-[3px] border-2"
            style={{
              borderColor: 'rgba(222, 222, 222, 0.8)',
              backgroundColor: 'black',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span
          className="text-[14px] font-bold"
          style={{
            textShadow: '1px 1px rgba(0, 0, 0, 0.7)',
          }}
        >
          {t.user}
        </span>
      </header>

      {/* Body - based on winXPReact-master */}
      <section
        className="flex relative"
        style={{
          margin: '0 2px',
          borderTop: '1px solid #385de7',
          boxShadow: '0 1px #385de7',
        }}
      >
        {/* Orange HR line */}
        <hr
          className="absolute left-0 right-0 top-0 h-[3px] border-0"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, #F7931E 50%, rgba(0, 0, 0, 0) 100%)',
          }}
        />

        {/* Left Menu - Programs */}
        <div className="start-menu-section start-menu-section--left">
          <div className="start-menu-primary">
            {primaryShortcuts.map((shortcut) => {
              const iconSrc = shortcut.icon ?? fallbackIcon;
              return (
                <button
                  key={shortcut.id}
                  className="start-menu-item start-menu-item--primary"
                  onClick={() => handleMenuAction(shortcut)}
                  onMouseEnter={handleHover}
                >
                  <div className="start-menu-item__icon">
                    {iconSrc ? (
                      <img src={iconSrc} alt={shortcut.title} className="w-6 h-6" />
                    ) : (
                      <span className="w-6 h-6" />
                    )}
                  </div>
                  <div className="start-menu-item__content">
                    <div className="start-menu-item__title font-bold">{shortcut.title}</div>
                    {shortcut.subtitle && (
                      <div className="start-menu-item__subtitle">{shortcut.subtitle}</div>
                    )}
                  </div>
                  <span className="start-menu-item__tag">{shortcut.tag}</span>
                </button>
              );
            })}
          </div>

          {pinnedPrograms.length > 0 && (
            <>
              <div className="start-menu-separator start-menu-separator--dense" />
              {pinnedPrograms.map((program) => {
                const iconSrc = program.icon ?? fallbackIcon;
                return (
                  <button
                    key={program.id}
                    className={`start-menu-item ${program.disabled ? 'disabled' : ''}`}
                    onClick={() => handleMenuAction(program)}
                  onMouseEnter={handleHover}
                  >
                    <div className="start-menu-item__icon">
                      {iconSrc ? (
                        <img src={iconSrc} alt={program.title} className="w-6 h-6" />
                      ) : (
                        <span className="w-6 h-6" />
                      )}
                    </div>
                    <div className="start-menu-item__title font-bold">{program.title}</div>
                  </button>
                );
              })}
              <div className="start-menu-separator start-menu-separator--dense" />
            </>
          )}

          <div className="start-menu-section__title">{frequentLabel}</div>

          {frequentPrograms.map((program, index) => {
            if (program.isSeparator) {
              return (
                <div
                  key={`frequent-separator-${index}`}
                  className="start-menu-separator"
                />
              );
            }

            const iconSrc = program.icon ?? fallbackIcon;
            return (
              <button
                key={program.id}
                className={`start-menu-item ${program.disabled ? 'disabled' : ''}`}
                onClick={() => handleMenuAction(program)}
                onMouseEnter={handleHover}
              >
                <div className="start-menu-item__icon">
                  {iconSrc ? (
                    <img src={iconSrc} alt={program.title} className="w-6 h-6" />
                  ) : (
                    <span className="w-6 h-6" />
                  )}
                </div>
                <div className="start-menu-item__title">{program.title}</div>
              </button>
            );
          })}

          <div className="flex-grow" />

          {/* Separator */}
          <div className="start-menu-separator" />

          {/* All Programs */}
          <button
            className="start-menu-item start-menu-item--footer"
            onClick={() => {
              onLaunchApp?.('all-programs');
              onClose();
            }}
            onMouseEnter={handleHover}
          >
            <span>{allProgramsLabel}</span>
            <ChevronsRight size={14} className="opacity-70" />
          </button>
        </div>

        {/* Right Menu - Places */}
        <div
          className="start-menu-section start-menu-section--right"
        >
          {placesLinks.map((place, index) => {
            if (place.isSeparator) {
              return (
                <div
                  key={`places-separator-${index}`}
                  className="start-menu-separator"
                />
              );
            }

            const iconSrc = place.icon ?? (place.id === 'my-computer' ? themeAssets.computerIcon : fallbackIcon);
            return (
              <button
                key={place.id}
                className={`start-menu-item ${place.disabled ? 'disabled' : ''}`}
                onClick={() => handleMenuAction(place)}
                onMouseEnter={handleHover}
              >
                <div className="start-menu-item__icon">
                  {iconSrc ? (
                    <img src={iconSrc} alt="" className="w-5 h-5" />
                  ) : place.id === 'help' ? (
                    <HelpCircle size={16} className="text-[#215dc6]" />
                  ) : place.id === 'search' ? (
                    <Search size={16} className="text-gray-600" />
                  ) : place.id === 'run' ? (
                    <FileText size={16} className="text-gray-600" />
                  ) : (
                    <Settings size={16} className="text-gray-600" />
                  )}
                </div>
                <div className="start-menu-item__title font-bold">{place.title}</div>
              </button>
            );
          })}

          {/* Separator */}
          <div className="start-menu-separator" />
        </div>
      </section>

      {/* Footer - based on winXPReact-master */}
      <footer
        className="flex self-end items-center justify-end text-white h-9 w-full"
        style={{
          background: 'linear-gradient(to bottom, #4282d6 0%, #3b85e0 3%, #418ae3 5%, #418ae3 17%, #3c87e2 21%, #3786e4 26%, #3482e3 29%, #2e7ee1 39%, #2374df 49%, #2072db 57%, #196edb 62%, #176bd8 72%, #1468d5 75%, #1165d2 83%, #0f61cb 88%)',
        }}
      >
        <div
          className="p-0.5 flex mr-[10px] items-center hover:bg-[rgba(60,80,210,0.5)] cursor-pointer rounded"
          onClick={() => {
            onSystemCommand?.('logoff');
            onClose();
          }}
          onMouseEnter={handleHover}
        >
          <Power size={22} className="text-yellow-400 mr-0.5 rounded-[3px]" />
          <span className="text-[11px]">{logOffLabel}</span>
        </div>
        <div
          className="p-0.5 flex mr-[10px] items-center hover:bg-[rgba(60,80,210,0.5)] cursor-pointer rounded"
          onClick={() => {
            onSystemCommand?.('shutdown');
            onClose();
          }}
          onMouseEnter={handleHover}
        >
          <Power size={22} className="text-red-400 mr-0.5 rounded-[3px]" />
          <span className="text-[11px]">{turnOffLabel}</span>
        </div>
      </footer>
    </section>
  );
}
