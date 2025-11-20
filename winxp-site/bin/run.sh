#!/bin/bash

# Скрипт запуска Windows XP сайта на Rust Axum для Linux/Mac
# Автор: AI Assistant

set -e

echo "=========================================="
echo "Запуск Windows XP сайта на Rust Axum"
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

echo "Компиляция проекта..."
cargo build --release

echo "=========================================="
echo "Запуск сервера на http://localhost:3000"
echo "=========================================="
echo "Для остановки нажмите Ctrl+C"
echo ""

# Запускаем сервер
./target/release/winxp-site
