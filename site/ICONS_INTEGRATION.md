# Интеграция иконок из Portfolio

## Обзор
Иконки из `@portfolio-main/public/img/icons/` готовы к интеграции в проект. Они находятся в формате WebP и организованы по категориям.

## Доступные наборы иконок

### 1. Системные иконки
- **Explorer**: `explorer-icon-lg/sm/xs.webp`
- **Computer**: `side-menu/computer-icon.webp`
- **Folder**: `documents/folder-docs-icon-lg/sm/xs.webp`
- **Trash/Recycle Bin**: `trash-icon-lg/sm/xs.webp`
- **Shutdown**: `shutdown-icon.webp`

### 2. Приложения
- **Notepad**: `notepad/notepad-icon-lg/sm/xs.webp`
- **Pictures**: `pictures/folder-images-icon-lg/sm/xs.webp`
- **Music/Media Player**: `music/playmusic-icon-lg/sm/xs.webp`
- **Minesweeper**: `minesweeper/minesweeper-icon-lg/sm/xs.webp`
- **DOOM**: `doom/doom-icon-lg/sm.webp`
- **Terminal/CMD**: `cmd-icon-lg/sm/xs.webp`
- **Calendar**: `calendar/calendar-icon-lg/sm/xs.webp`
- **CV**: `cv/cv-icon-lg/sm/xs.webp`
- **Email/Outlook**: `contact/email-icon-lg/sm/xs.webp`

### 3. Проекты
- **Projects (общая)**: `projects/projects-icon-lg/sm/xs.webp`
- **Aidella**: `projects/folder-aidella-icon.webp`
- **Clench**: `projects/folder-clench-icon.webp`
- **EMC2**: `projects/folder-emc2-icon.webp`
- **Fanny**: `projects/folder-fanny-icon.webp`
- **Logma**: `projects/folder-logma-icon.webp`
- **Pangaia**: `projects/folder-pangaia-icon.webp`
- **Homeserver**: `projects/homeserver-icon.webp`

### 4. UI элементы
- **Volume**: `volume-icon-lg/sm/xs.webp`, `mute-icon-lg/sm/xs.webp`
- **Full Screen**: `full-screen-icon-lg/sm/xs.webp`
- **Info**: `info-icon.webp`
- **Windows Header Tools**: `windows-header-tools/` (11 иконок)

### 5. Side Menu (панель задач)
- `side-menu/` содержит 19 иконок для боковой панели Explorer

## Рекомендации по интеграции

### Этап 1: Копирование иконок
```bash
# Скопировать иконки в assets каждой темы
cp -r Temp/portfolio-main/public/img/icons/* site/src/themes/winxp/assets/icons/portfolio/
cp -r Temp/portfolio-main/public/img/icons/* site/src/themes/webos/assets/icons/portfolio/
```

### Этап 2: Обновление themeAssets.ts

Для каждой темы добавить пути к новым иконкам:

```typescript
// site/src/themes/winxp/themeAssets.ts
export interface ThemeAssets {
  // Существующие...
  
  // Новые из portfolio
  explorerIconLg?: string;
  explorerIconSm?: string;
  notepadIconLg?: string;
  notepadIconSm?: string;
  picturesIconLg?: string;
  picturesIconSm?: string;
  // и т.д.
}
```

### Этап 3: Использование в приложениях

```typescript
// В Desktop.tsx
import { THEME_ASSETS } from './themeAssets';

const themeAssets = THEME_ASSETS[theme];
const explorerIcon = themeAssets.explorerIconLg || fallbackIcon;
```

### Этап 4: Размеры иконок

Portfolio использует три размера:
- **lg** (Large): 48x48px - для desktop иконок
- **sm** (Small): 32x32px - для меню и списков
- **xs** (Extra Small): 16x16px - для toolbar и мелких элементов

Используйте соответствующий размер в зависимости от контекста.

## Преимущества WebP формата

- ✅ Меньший размер файлов (~30% меньше PNG)
- ✅ Отличное качество
- ✅ Прозрачность (альфа-канал)
- ✅ Поддержка всеми современными браузерами

## Следующие шаги

1. **Копировать иконки** в themes/{theme}/assets/icons/portfolio/
2. **Обновить themeAssets.ts** для каждой темы
3. **Заменить существующие PNG иконки** на WebP где возможно
4. **Добавить fallback** для браузеров без поддержки WebP (если нужно)
5. **Оптимизировать** - использовать правильные размеры

## Пример использования

```typescript
// До
import myComputerIcon from '../../assets/xp/icons/mycomputer.png';

// После
import myComputerIcon from '../../themes/winxp/assets/icons/portfolio/side-menu/computer-icon.webp';

// Или через themeAssets
const { computerIcon } = THEME_ASSETS[theme];
```

## Заметки

- Иконки из `minesweeper/` уже интегрированы в игру
- Иконки из `projects/tools/` (28 SVG) могут использоваться для технологий в ProjectsApp
- Side menu иконки идеально подходят для sidebar в MyComputer
- Windows header tools могут использоваться для toolbar в окнах

