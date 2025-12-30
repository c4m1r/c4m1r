/**
 * Экспорт всех приложений
 */

// Desktop система
export * from './desktop';

// Приложения
export { Calculator } from './calc/Calculator';
export { Paint } from './paint/Paint';
export { ControlPanel } from './ControlPanel';
export { TaskManager } from './TaskManager';
export { Notepad } from './notepad';
export { PictureViewer } from './pictureview';
export { MyComputer } from './explorer';
export { PicturesGallery } from './pictures';
export { BlogViewer } from './blog';

// Интернет
export { InternetExplorer } from './internetexplorer/InternetExplorer';
export { OutlookExpress } from './outlook/OutlookExpress';

// Медиа и игры
export { WindowsMediaPlayer } from './mediaplayer/WindowsMediaPlayer';
export { DoomPlayer } from './doom/DoomPlayer';
export { Minesweeper } from './minesweeper';
export { CalendarApp } from './calendar';
export { GamesFolder } from './games/GamesFolder';
export { MyCV } from './mycv/MyCV';
export { ProjectsGrid } from './ProjectsGrid';

// Системные
export { GrubMenu } from './GrubMenu';
export { Terminal } from './Terminal';
export { BlogSite } from './BlogSite';
export { BlogApp } from './BlogApp';
export { ProjectsApp } from './ProjectsApp';
export { AboutApp } from './AboutApp';
export { MarkdownViewer } from './MarkdownViewer';

// Утилиты
export * from '../utils/contentLoader';
