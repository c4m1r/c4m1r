import { useState, useCallback } from 'react';
import { BootScreen } from './BootScreen';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { Desktop } from './Desktop';
import { SystemTransitionScreen } from './SystemTransitionScreen';
import { useApp } from '../../contexts/AppContext';

type WebOSState = 'boot' | 'login' | 'welcome' | 'desktop' | 'logoff' | 'shutdown';

export function WebOS() {
  const [state, setState] = useState<WebOSState>('boot');
  const { setMode } = useApp();
  const exitToGrub = useCallback(() => {
    setMode('grub');
    setState('boot');
  }, [setMode]);
  const handleSystemCommand = useCallback((command: 'logoff' | 'shutdown') => {
    if (command === 'shutdown') {
      setState('shutdown');
    } else {
      setState('logoff');
    }
  }, []);

  if (state === 'boot') {
    return <BootScreen onComplete={() => setState('login')} />;
  }

  if (state === 'login') {
    return <LoginScreen onLogin={() => setState('welcome')} />;
  }

  if (state === 'welcome') {
    return <WelcomeScreen onComplete={() => setState('desktop')} />;
  }

  if (state === 'logoff') {
    return (
      <SystemTransitionScreen
        mode="logoff"
        onComplete={() => setState('login')}
      />
    );
  }

  if (state === 'shutdown') {
    return (
      <SystemTransitionScreen
        mode="shutdown"
        onComplete={exitToGrub}
      />
    );
  }

  return <Desktop onSystemCommand={handleSystemCommand} />;
}
