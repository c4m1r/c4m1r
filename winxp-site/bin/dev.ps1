# Скрипт разработки Windows XP сайта на Rust Axum для Windows
# Автор: AI Assistant

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Режим разработки - Windows XP сайт" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Переходим в директорию проекта
Set-Location "$PSScriptRoot\.."

# Очистка кеша и временных файлов
Write-Host "🧹 Очистка кеша..." -ForegroundColor Yellow

# Очистка Cargo кеша
cargo clean

# Очистка target с повторными попытками
if (Test-Path "target") {
    $attempts = 0
    $maxAttempts = 3
    while ((Test-Path "target") -and ($attempts -lt $maxAttempts)) {
        try {
            Remove-Item "target" -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Target очищен" -ForegroundColor Green
        } catch {
            $attempts++
            Write-Host "⚠️  Попытка $attempts удалить target..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
    if (Test-Path "target") {
        Write-Host "❌ Не удалось очистить target" -ForegroundColor Red
    }
}

if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# Проверяем наличие Rust
if (!(Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "Ошибка: Rust/Cargo не установлен. Пожалуйста, установите Rust с https://rustup.rs/" -ForegroundColor Red
    exit 1
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Запуск сервера в режиме разработки на http://localhost:3000" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Сервер будет автоматически перезапускаться при изменениях" -ForegroundColor Yellow
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Запускаем сервер в режиме разработки
cargo run
