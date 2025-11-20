#!/bin/bash

# Скрипт разработки Windows XP сайта на Rust Axum для Linux/Mac
# Автор: AI Assistant

set -e

echo "=========================================="
echo "Режим разработки - Windows XP сайт"
echo "=========================================="

# Переходим в директорию проекта
cd "$(dirname "$0")/../"

# Очистка кеша и временных файлов
echo "🧹 Очистка кеша..."
if [ -d "target" ]; then
    rm -rf target
fi
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi

# Очистка Cargo кеша
cargo clean

# Проверяем наличие Rust
if ! command -v cargo &> /dev/null; then
    echo "Ошибка: Rust/Cargo не установлен. Пожалуйста, установите Rust с https://rustup.rs/"
    exit 1
fi

echo "=========================================="
echo "Запуск сервера в режиме разработки на http://localhost:3000"
echo "=========================================="
echo "Сервер будет автоматически перезапускаться при изменениях"
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запускаем сервер в режиме разработки
cargo run
