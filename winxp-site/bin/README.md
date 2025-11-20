# Скрипты запуска Windows XP Desktop

Эта папка содержит скрипты для запуска, разработки и тестирования проекта Windows XP Desktop.

## 📁 Содержимое

### 🚀 Скрипты запуска
- `run.ps1` - Запуск production версии (Windows)
- `run.sh` - Запуск production версии (Linux/Mac)
- `dev.ps1` - Запуск в режиме разработки (Windows)
- `dev.sh` - Запуск в режиме разработки (Linux/Mac)

### 🧪 Автотесты
- `autotests.ps1` - Полный набор автотестов (Windows)
- `autotests.sh` - Полный набор автотестов (Linux/Mac)

## 🚀 Использование

### Windows
```powershell
# Режим разработки
.\bin\dev.ps1

# Production запуск
.\bin\run.ps1 -Release

# Автотесты
.\bin\autotests.ps1
```

### Linux/Mac
```bash
# Режим разработки
./bin/dev.sh

# Production запуск
./bin/run.sh

# Автотесты
./bin/autotests.sh
```

## 🧪 Автотесты

Автотесты проверяют:
- ✅ Запуск сервера
- ✅ Все API endpoints (`/health`, `/api/config`, `/api/apps`)
- ✅ Статические файлы (CSS, JS, изображения)
- ✅ Приложения (Minesweeper, Notepad, Paint, etc.)
- ✅ Конфигурацию системы
- ✅ Корректность JSON ответов

### Параметры автотестов

#### Windows (`autotests.ps1`)
```powershell
# Подробный вывод
.\bin\autotests.ps1 -Verbose

# Только тесты без запуска сервера
.\bin\autotests.ps1 -NoServer

# Изменить таймаут сервера
.\bin\autotests.ps1 -ServerTimeout 10
```

#### Linux/Mac (`autotests.sh`)
```bash
# Подробный вывод
VERBOSE=true ./bin/autotests.sh

# Только тесты без запуска сервера
NO_SERVER=true ./bin/autotests.sh

# Изменить таймаут сервера
SERVER_TIMEOUT=10 ./bin/autotests.sh
```

## 🧹 Очистка кеша

Все скрипты запуска (`run.*`, `dev.*`) автоматически выполняют:
- Очистку папки `target/` (скомпилированные Rust файлы)
- Очистку папки `node_modules/` (если есть)
- Очистку Cargo кеша (`cargo clean`)

Это обеспечивает чистую сборку и исключает проблемы с кешированием.

## 📊 Результаты тестирования

Автотесты возвращают:
- **Код выхода 0** - все тесты пройдены ✅
- **Код выхода 1** - некоторые тесты провалены ❌

Пример вывода:
```
🚀 Полный автотест Windows XP Desktop
=====================================
Сервер будет запущен на 5 секунд для тестирования

🔧 Запуск сервера...
⏳ Ожидание запуска сервера (5 сек)...

📊 Результаты тестирования:
============================
✅ Health Check API
✅ Configuration API
✅ Apps List API
✅ Главная страница
✅ Minesweeper App
✅ Notepad App
✅ CSS Stylesheet
✅ Desktop JS

📈 Итоги:
Всего тестов: 14
Пройдено: 14
Провалено: 0

🎉 Все тесты пройдены успешно! Сервер работает корректно.
```

## 🛠 Настройка

### Добавление новых тестов

В файлах `autotests.*` добавьте новый вызов функции `test_endpoint`:

```powershell
# PowerShell
Test-Endpoint "http://localhost:3000/new-endpoint" "New Feature" 200

# Bash
test_endpoint "http://localhost:3000/new-endpoint" "New Feature" 200
```

### Изменение таймаутов

По умолчанию сервер запускается на 5 секунд перед тестированием. Измените переменные:
- `SERVER_TIMEOUT` (bash)
- `-ServerTimeout` (PowerShell)

## 🔧 Устранение неполадок

### Сервер не запускается
- Проверьте, что порт 3000 свободен
- Убедитесь, что Rust установлен (`cargo --version`)
- Проверьте логи компиляции

### Тесты падают
- Увеличьте `SERVER_TIMEOUT`
- Проверьте подключение к `localhost:3000`
- Запустите с `-Verbose` для детальной информации

### Проблемы с кешем
- Скрипты автоматически очищают кеш
- Принудительно очистите: `cargo clean && rm -rf target/`

---

**Примечание**: Скрипты автоматически находят проектную директорию относительно своего расположения в `bin/`.
