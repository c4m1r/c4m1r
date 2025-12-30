import { useApp } from '../../contexts/AppContext';
import { StartMenu98 } from './StartMenu98';
import { StartMenuXP } from './StartMenuXP';

interface StartMenuProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  onOpenPath?: (path: string) => void;
  onSystemCommand?: (command: 'logoff' | 'shutdown') => void;
  onHover?: () => void;
}

export function StartMenu({ onClose, onLaunchApp, onOpenPath, onSystemCommand, onHover }: StartMenuProps) {
  const { theme } = useApp();

  if (theme === 'win-98') {
    return (
      <StartMenu98
        onClose={onClose}
        onLaunchApp={onLaunchApp}
        onOpenPath={onOpenPath}
        onSystemCommand={onSystemCommand}
        onHover={onHover}
      />
    );
  }

  const appearance = theme === 'win-xp' ? 'win-xp' : 'webos';

  return (
    <StartMenuXP
      onClose={onClose}
      onLaunchApp={onLaunchApp}
      onOpenPath={onOpenPath}
      onSystemCommand={onSystemCommand}
      appearance={appearance}
      onHover={onHover}
    />
  );
}
