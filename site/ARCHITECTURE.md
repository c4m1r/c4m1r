# Архитектура проекта C4m1r

## Обзор
Проект представляет собой мультитемную веб-операционную систему с поддержкой различных ретро-тем (Windows XP, Windows 98, Windows 7, WebOS и других).

## Структура проекта

```
site/src/
├── apps/                    # Универсальные приложения для всех тем
│   ├── desktop/            # Desktop система (общая для всех тем)
│   │   ├── Desktop.tsx     # Основной Desktop компонент
│   │   └── DesktopOS.tsx   # Обёртка для динамической загрузки тем
│   ├── calc/              # Калькулятор
│   ├── doom/              # Doom игра
│   ├── internetexplorer/  # Internet Explorer
│   ├── mediaplayer/       # Windows Media Player
│   ├── minesweeper/       # Сапёр
│   ├── outlook/           # Outlook Express
│   ├── paint/             # Paint
│   ├── wiki/              # Wiki приложение
│   ├── AboutApp.tsx
│   ├── BlogApp.tsx
│   ├── BlogSite.tsx
│   ├── ControlPanel.tsx
│   ├── GrubMenu.tsx       # GRUB загрузчик
│   ├── MarkdownViewer.tsx
│   ├── ProjectsApp.tsx
│   ├── TaskManager.tsx
│   └── Terminal.tsx
│
├── themes/                 # Темы операционных систем
│   ├── winxp/             # Windows XP тема
│   │   ├── assets/        # Ассеты XP (иконки, звуки, изображения)
│   │   │   ├── avatars/
│   │   │   ├── boot/
│   │   │   ├── icons/
│   │   │   ├── sounds/
│   │   │   └── widgets/
│   │   ├── BootScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── Desktop.tsx    # Экспортирует универсальный Desktop
│   │   ├── SystemTransitionScreen.tsx
│   │   ├── xp.css         # Стили Windows XP
│   │   └── index.tsx      # Входная точка темы
│   │
│   ├── webos/             # WebOS тема (старая структура, будет переделана)
│   ├── win98/             # Windows 98 тема
│   ├── win7/              # Windows 7 тема
│   ├── win10/             # Windows 10 тема
│   ├── win11/             # Windows 11 тема
│   ├── ubuntu/            # Ubuntu тема
│   ├── arch/              # Arch Linux тема
│   └── halloween/         # Halloween тема
│
├── contexts/              # Глобальные React контексты
│   └── AppContext.tsx     # Основной контекст приложения (mode, theme, language)
│
├── content/               # Контент для приложений (русский по умолчанию)
│   ├── about/            # О нас
│   ├── blog/             # Статьи блога (markdown)
│   ├── pictures/         # Изображения
│   │   └── wallpapers/   # Обои для тем
│   ├── projects/         # Проекты
│   └── wiki/             # Wiki статьи
│
├── i18n/                  # Интернационализация
│   ├── content/          # Переводы контента
│   │   ├── en/
│   │   ├── cn/
│   │   ├── ja/
│   │   ├── ko/
│   │   └── sp/
│   └── translations.ts    # Основные переводы интерфейса
│
├── utils/                 # Утилиты
│   ├── assetResolver.ts   # Резолвер ассетов
│   └── FileSystem.ts      # Виртуальная файловая система
│
├── App.tsx                # Главный компонент приложения
├── main.tsx               # Точка входа
└── index.css              # Глобальные стили
```

## Принципы архитектуры

### 1. Модульность тем
- Каждая тема находится в отдельной папке в `themes/`
- Тема содержит свои уникальные компоненты: BootScreen, LoginScreen, WelcomeScreen, SystemTransitionScreen
- Desktop компонент универсален для всех тем (находится в `apps/desktop/`)
- Ассеты темы (иконки, звуки, изображения) хранятся в `assets/` внутри папки темы
- CSS стили темы хранятся в одном файле (например, `xp.css`)

### 2. Универсальные приложения
- Все приложения находятся в `apps/` и доступны для всех тем
- Каждое приложение может иметь свою папку с ассетами если нужны специфичные ресурсы
- Приложения не зависят от конкретной темы и адаптируются через CSS переменные

### 3. Динамическая загрузка контента
- Весь контент (статьи, проекты, wiki) хранится в `content/`
- Контент по умолчанию на русском языке
- Переводы контента хранятся в `i18n/content/{язык}/`
- Изображения для приложения "Мои изображения" загружаются динамически из `content/pictures/`
- Обои для тем берутся из `content/pictures/wallpapers/`

### 4. Интернационализация
- Язык по умолчанию: русский
- Поддерживаемые языки: ru, en, es, zh, ja, ko
- Переводы интерфейса в `i18n/translations.ts`
- Переводы контента в `i18n/content/{язык}/`

### 5. Контекстное управление состоянием
- `AppContext` содержит глобальное состояние:
  - `mode`: текущий режим ('grub' | 'blog' | 'webos' | 'terminal')
  - `theme`: активная тема ('win-xp' | 'win-98' | 'webos' | 'win7' и т.д.)
  - `language`: выбранный язык

## Жизненный цикл приложения

1. **Запуск** → `main.tsx` инициализирует `AppProvider`
2. **GRUB Menu** → Пользователь выбирает тему или режим
3. **Загрузка темы**:
   - Boot Screen (загрузка)
   - Login Screen (вход в систему)
   - Welcome Screen (приветствие)
   - Desktop (рабочий стол)
4. **Работа с Desktop** → Открытие приложений, работа с файлами
5. **Выход**:
   - Log Off → возврат к Login Screen
   - Shut Down → возврат к GRUB Menu через SystemTransitionScreen

## Добавление новой темы

1. Создайте папку в `themes/{название-темы}/`
2. Создайте структуру:
   ```
   themes/{название-темы}/
   ├── assets/
   │   ├── icons/
   │   ├── sounds/
   │   └── ...
   ├── BootScreen.tsx
   ├── LoginScreen.tsx
   ├── WelcomeScreen.tsx
   ├── Desktop.tsx (экспорт из apps/desktop/Desktop.tsx)
   ├── SystemTransitionScreen.tsx
   ├── {название}.css
   └── index.tsx
   ```
3. Добавьте ThemeId в `contexts/AppContext.tsx`
4. Добавьте case в `App.tsx` для загрузки вашей темы
5. Добавьте опцию в `GrubMenu.tsx`

## Добавление нового приложения

1. Создайте папку в `apps/{название-приложения}/`
2. Создайте главный компонент приложения
3. Если нужны специфичные ассеты, добавьте папку `assets/`
4. Экспортируйте приложение через `apps/index.ts`
5. Добавьте иконку приложения в ассеты каждой темы (если нужна уникальная)
6. Интегрируйте в Desktop через меню Пуск или ярлык

## Оптимизация и производительность

- Динамическая загрузка тем (lazy loading)
- Минимизация дублирования кода
- CSS переменные для унификации стилей
- Оптимизация изображений (использование WebP где возможно)
- Code splitting для приложений

## Примеры из портфолио

Для вдохновения и доработки дизайна используется проект `@portfolio-main`:
- Структура приложений
- Иконки и UI элементы
- Анимации и переходы
- Общие паттерны UX

## Статус реализации

### ✅ Выполнено:
- [x] Создана модульная архитектура
- [x] Переделана WebOS тема под новую структуру
- [x] Создана Windows XP тема
- [x] Реализована динамическая загрузка контента из `content/`
- [x] Созданы утилиты для загрузки: blog, projects, wiki, pictures
- [x] Русский язык по умолчанию
- [x] Централизованное управление темами через `themeConfig.ts`
- [x] Документация по интеграции иконок (`ICONS_INTEGRATION.md`)

### 🔄 В процессе:
- [ ] Интеграция иконок из `@portfolio-main`
- [ ] Добавление Windows 98 темы
- [ ] Добавление Windows 7 темы

### 📋 Запланировано:
- [ ] Добавить поддержку тем Ubuntu, Arch, Windows 10/11
- [ ] Реализовать полноценную файловую систему с операциями
- [ ] Добавить звуковые темы для каждой ОС
- [ ] Создать систему плагинов для приложений

## Новые возможности

### Динамическая загрузка контента

```typescript
import { loadBlogPosts, loadPictures, loadWallpapers, loadWikiArticles } from '@/utils/contentLoader';

// Загрузка статей блога
const posts = await loadBlogPosts();

// Загрузка изображений
const pictures = await loadPictures();

// Загрузка обоев
const wallpapers = await loadWallpapers();

// Загрузка wiki статей
const articles = await loadWikiArticles('IT/React');
```

### Управление темами

```typescript
import { getThemeConfig, isXPFamily } from '@/themes/themeConfig';

const config = getThemeConfig('win-xp');
console.log(config.name); // "Windows XP"
console.log(config.hasBootScreen); // true

if (isXPFamily(theme)) {
  // Специфичная логика для XP семейства
}
```

