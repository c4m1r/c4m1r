# Скрипт сборки и запуска статического сайта для Windows PowerShell

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Сборка статического сайта c4m1r" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Переходим в директорию скрипта
Set-Location $PSScriptRoot

# Проверяем наличие Node.js
try {
    $nodeVersion = node --version
    Write-Host "Найден Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Ошибка: Node.js не установлен. Пожалуйста, установите Node.js." -ForegroundColor Red
    exit 1
}

# Проверяем наличие npm
try {
    $npmVersion = npm --version
    Write-Host "Найден npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Ошибка: npm не установлен. Пожалуйста, установите npm." -ForegroundColor Red
    exit 1
}

# Устанавливаем зависимости, если нужно
if (-not (Test-Path "node_modules")) {
    Write-Host "Установка зависимостей..." -ForegroundColor Yellow
    npm install
}

# Запускаем сборку
Write-Host "Запуск сборки..." -ForegroundColor Yellow
npm run build

# Проверяем результат сборки
if (-not (Test-Path "public\index.html")) {
    Write-Host "Ошибка: Сборка не удалась. Файл index.html не найден." -ForegroundColor Red
    exit 1
}

Write-Host "Сборка завершена успешно!" -ForegroundColor Green

# Запускаем локальный сервер
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Запуск локального сервера на http://localhost:4000" -ForegroundColor Cyan
Write-Host "Нажмите Ctrl+C для остановки" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Проверяем наличие live-server
$liveServerPath = Join-Path $PSScriptRoot "node_modules\.bin\live-server.cmd"
if (Test-Path $liveServerPath) {
    & $liveServerPath public --port=4000 --open=/index.html
} else {
    npm run serve
}

