import { useApp } from './contexts/AppContext';
import { GrubMenu } from './apps/GrubMenu';
import { BlogSite } from './apps/BlogSite';
import { Terminal } from './apps/Terminal';
import { WindowsXP } from './themes/winxp';
import { WebOS } from './themes/webos';

function App() {
  const { mode, theme } = useApp();

  // Режим GRUB загрузчика
  if (mode === 'grub') {
    return <GrubMenu />;
  }

  // Режим блога
  if (mode === 'blog') {
    return <BlogSite />;
  }

  // Режим терминала
  if (mode === 'terminal') {
    return <Terminal />;
  }

  // Режим WebOS/Desktop - динамическая загрузка темы
  if (mode === 'webos') {
    // В зависимости от темы загружаем нужный компонент
    switch (theme) {
      case 'win-xp':
        return <WindowsXP />;
      case 'win-98':
        // TODO: Создать Windows98 тему
        return <WebOS />;
      case 'win7':
        // TODO: Создать Windows7 тему
        return <WebOS />;
      case 'webos':
        return <WebOS />;
      default:
        return <WindowsXP />;
    }
  }

  return <GrubMenu />;
}

export default App;
