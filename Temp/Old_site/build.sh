#!/bin/bash

# Скрипт сборки и запуска статического сайта для Linux/Mac

set -e

echo "=========================================="
echo "Сборка статического сайта c4m1r"
echo "=========================================="

# Переходим в директорию скрипта
cd "$(dirname "$0")"

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "Ошибка: Node.js не установлен. Пожалуйста, установите Node.js."
    exit 1
fi

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "Ошибка: npm не установлен. Пожалуйста, установите npm."
    exit 1
fi

# Устанавливаем зависимости, если нужно
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    npm install
fi

# Запускаем сборку
echo "Запуск сборки..."
npm run build

# Проверяем наличие live-server
if ! command -v live-server &> /dev/null && [ ! -f "node_modules/.bin/live-server" ]; then
    echo "Установка live-server..."
    npm install
fi

# Запускаем локальный сервер
echo "=========================================="
echo "Запуск локального сервера на http://localhost:4000"
echo "Нажмите Ctrl+C для остановки"
echo "=========================================="

if [ -f "node_modules/.bin/live-server" ]; then
    ./node_modules/.bin/live-server public --port=4000 --open=/index.html
else
    npm run serve
fi

