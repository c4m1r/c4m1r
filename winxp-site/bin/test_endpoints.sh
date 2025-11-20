#!/bin/bash

# Полный автотест Windows XP Desktop для Linux/Mac
# Автор: AI Assistant
# Запускает сервер, тестирует все endpoints, проверяет конфигурацию

set -e

VERBOSE=${VERBOSE:-false}
NO_SERVER=${NO_SERVER:-false}
SERVER_TIMEOUT=${SERVER_TIMEOUT:-5}

echo "🚀 Полный автотест Windows XP Desktop"
echo "====================================="
echo "Сервер будет запущен на $SERVER_TIMEOUT секунд для тестирования"
echo ""

BASE_URL="http://localhost:3000"
SERVER_PID=""
TEST_RESULTS=()
PASSED=0
FAILED=0

# Функция для запуска сервера
start_test_server() {
    echo "🔧 Запуск сервера..."
    cd "$(dirname "$0")/../"
    cargo run > /dev/null 2>&1 &
    SERVER_PID=$!
    echo "⏳ Ожидание запуска сервера ($SERVER_TIMEOUT сек)..."
    sleep $SERVER_TIMEOUT
}

# Функция для остановки сервера
stop_test_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo "🛑 Остановка сервера..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi
}

# Функция для тестирования endpoint
test_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    local skip_content="${4:-false}"

    if [ "$VERBOSE" = "true" ]; then
        echo ""
        echo "📡 Тестирую: $description"
        echo "URL: $url"
    fi

    local result="❌ $description"
    local success=false
    local error_msg=""

    if command -v curl >/dev/null 2>&1; then
        # Используем curl
        local response
        if ! response=$(curl -s -w "HTTPSTATUS:%{http_code};" -o /tmp/curl_response.txt "$url" 2>/dev/null); then
            error_msg="Ошибка curl запроса"
        else
            local http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            local content=$(cat /tmp/curl_response.txt 2>/dev/null || echo "")

            if [ "$http_code" = "$expected_status" ]; then
                success=true
                result="✅ $description"
                if [ "$VERBOSE" = "true" ]; then
                    echo "✅ Статус: $http_code"
                fi

                # Проверка JSON контента
                if [ "$skip_content" != "true" ] && [ ! -z "$content" ] && [[ "$url" == *"/api/"* ]]; then
                    if ! echo "$content" | python3 -m json.tool >/dev/null 2>&1; then
                        success=false
                        error_msg="Некорректный JSON"
                        result="❌ $description: $error_msg"
                    elif [ "$VERBOSE" = "true" ]; then
                        echo "📄 JSON ответ получен"
                    fi
                fi
            else
                error_msg="Неожиданный статус: $http_code (ожидался $expected_status)"
                result="❌ $description: $error_msg"
                if [ "$VERBOSE" = "true" ]; then
                    echo "❌ $error_msg"
                fi
            fi
        fi
    else
        error_msg="curl не установлен"
        result="❌ $description: $error_msg"
    fi

    TEST_RESULTS+=("$result")

    if [ "$success" = "true" ]; then
        ((PASSED++))
    else
        ((FAILED++))
        if [ "$VERBOSE" = "true" ]; then
            echo "❌ $error_msg"
        fi
    fi
}

# Функция для отображения результатов
show_test_results() {
    echo ""
    echo "📊 Результаты тестирования:"
    echo "============================"

    for result in "${TEST_RESULTS[@]}"; do
        echo "$result"
    done

    echo ""
    echo "📈 Итоги:"
    echo "Всего тестов: $((${#TEST_RESULTS[@]}))"
    echo "Пройдено: $PASSED"
    echo "Провалено: $FAILED"

    if [ $FAILED -eq 0 ]; then
        echo ""
        echo "🎉 Все тесты пройдены успешно! Сервер работает корректно."
        return 0
    else
        echo ""
        echo "⚠️  Некоторые тесты провалены. Проверьте работу сервера."
        return 1
    fi
}

# Обработка сигналов для корректной остановки
trap stop_test_server EXIT

# Основная логика
if [ "$NO_SERVER" != "true" ]; then
    start_test_server
fi

# Тесты API endpoints
test_endpoint "$BASE_URL/health" "Health Check API" 200
test_endpoint "$BASE_URL/api/config" "Configuration API" 200
test_endpoint "$BASE_URL/api/apps" "Apps List API" 200
test_endpoint "$BASE_URL/" "Главная страница" 200

# Тесты приложений
test_endpoint "$BASE_URL/apps/minesweeper" "Minesweeper App" 200
test_endpoint "$BASE_URL/apps/notepad" "Notepad App" 200
test_endpoint "$BASE_URL/apps/paint" "Paint App" 200
test_endpoint "$BASE_URL/apps/winamp" "Winamp App" 200
test_endpoint "$BASE_URL/apps/internet-explorer" "Internet Explorer App" 200
test_endpoint "$BASE_URL/apps/my-computer" "My Computer App" 200
test_endpoint "$BASE_URL/apps/invalid-app" "Invalid App (should 404)" 404

# Тесты статических файлов
test_endpoint "$BASE_URL/static/css/style.css" "CSS Stylesheet" 200
test_endpoint "$BASE_URL/static/js/desktop.js" "Desktop JS" 200
test_endpoint "$BASE_URL/static/js/apps.js" "Apps JS" 200
test_endpoint "$BASE_URL/static/apps/config.json" "Config JSON" 200

# Проверка конфигурации
if command -v curl >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    echo ""
    echo "🔍 Проверка конфигурации..."
    if curl -s "$BASE_URL/api/config" | python3 -c "
import sys, json
try:
    config = json.load(sys.stdin)
    if 'apps' in config and 'desktopIcons' in config and 'startMenuItems' in config:
        print('✅ Конфигурация имеет корректную структуру')
        app_count = len(config.get('apps', {}))
        print(f'📱 Найдено приложений: {app_count}')
    else:
        print('⚠️  Конфигурация может иметь неполную структуру')
except:
    print('❌ Ошибка парсинга конфигурации')
" 2>/dev/null; then
    :
else
    echo "⚠️  Невозможно проверить конфигурацию (curl или python3 не найдены)"
fi
fi

# Показать результаты
show_test_results
