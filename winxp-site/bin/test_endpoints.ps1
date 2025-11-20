# Полный автотест Windows XP Desktop
# Автор: AI Assistant
# Запускает сервер, тестирует все endpoints, проверяет конфигурацию

param(
    [switch]$Verbose = $false,
    [switch]$NoServer = $false,
    [int]$ServerTimeout = 5
)

Write-Host "🚀 Полный автотест Windows XP Desktop" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Сервер будет запущен на 5 секунд для тестирования" -ForegroundColor Yellow
Write-Host ""

$baseUrl = "http://localhost:3000"
$testResults = @()
$serverJob = $null

function Start-TestServer {
    Write-Host "🔧 Запуск сервера..." -ForegroundColor Blue
    $serverJob = Start-Job -ScriptBlock {
        param($ProjectPath)
        Set-Location $ProjectPath
        cargo run 2>$null
    } -ArgumentList (Get-Location).Path -Name "WinXPServerTest"
}

function Stop-TestServer {
    if ($serverJob) {
        Write-Host "🛑 Остановка сервера..." -ForegroundColor Blue
        Stop-Job -Name "WinXPServerTest" -ErrorAction SilentlyContinue
        Remove-Job -Name "WinXPServerTest" -ErrorAction SilentlyContinue
    }
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$ExpectedStatus = 200,
        [switch]$SkipContent = $false
    )

    if ($Verbose) {
        Write-Host "`n📡 Тестирую: $Description" -ForegroundColor Yellow
        Write-Host "URL: $Url" -ForegroundColor Gray
    }

    $result = @{
        Description = $Description
        Url = $Url
        ExpectedStatus = $ExpectedStatus
        ActualStatus = 0
        Success = $false
        Error = $null
        ContentLength = 0
    }

    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10

        $result.ActualStatus = $response.StatusCode
        $result.ContentLength = $response.Content.Length

        if ($response.StatusCode -eq $ExpectedStatus) {
            $result.Success = $true
            if ($Verbose) {
                Write-Host "✅ Статус: $($response.StatusCode)" -ForegroundColor Green
            }
        } else {
            $result.Error = "Неожиданный статус: $($response.StatusCode) (ожидался $ExpectedStatus)"
            if ($Verbose) {
                Write-Host "❌ $($result.Error)" -ForegroundColor Red
            }
        }

        # Проверка контента для JSON endpoints
        if (!$SkipContent -and $response.Content -and $Url -match "/api/") {
            try {
                $json = $response.Content | ConvertFrom-Json
                if ($Verbose) {
                    Write-Host "📄 JSON ответ получен" -ForegroundColor Blue
                }
            } catch {
                $result.Error = "Некорректный JSON: $($_.Exception.Message)"
                $result.Success = $false
            }
        }

    } catch {
        $result.Error = $_.Exception.Message
        $result.Success = $false
        if ($Verbose) {
            Write-Host "❌ Ошибка запроса: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    $testResults += $result
    return $result
}

function Show-TestResults {
    Write-Host "`n📊 Результаты тестирования:" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan

    $passed = 0
    $failed = 0

    foreach ($result in $testResults) {
        if ($result.Success) {
            Write-Host "✅ $($result.Description)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "❌ $($result.Description): $($result.Error)" -ForegroundColor Red
            $failed++
        }
    }

    Write-Host "`n📈 Итоги:" -ForegroundColor Yellow
    Write-Host "Всего тестов: $($testResults.Count)" -ForegroundColor White
    Write-Host "Пройдено: $passed" -ForegroundColor Green
    Write-Host "Провалено: $failed" -ForegroundColor Red

    if ($failed -eq 0) {
        Write-Host "`n🎉 Все тесты пройдены успешно! Сервер работает корректно." -ForegroundColor Green
        return $true
    } else {
        Write-Host "`n⚠️  Некоторые тесты провалены. Проверьте работу сервера." -ForegroundColor Red
        return $false
    }
}

# Основная логика
try {
    if (!$NoServer) {
        Start-TestServer
        Write-Host "⏳ Ожидание запуска сервера ($ServerTimeout сек)..." -ForegroundColor Blue
        Start-Sleep -Seconds $ServerTimeout
    }

    # Тесты API endpoints
    Test-Endpoint "$baseUrl/health" "Health Check API" 200
    Test-Endpoint "$baseUrl/api/config" "Configuration API" 200
    Test-Endpoint "$baseUrl/api/apps" "Apps List API" 200
    Test-Endpoint "$baseUrl/" "Главная страница" 200

    # Тесты приложений
    Test-Endpoint "$baseUrl/apps/minesweeper" "Minesweeper App" 200
    Test-Endpoint "$baseUrl/apps/notepad" "Notepad App" 200
    Test-Endpoint "$baseUrl/apps/paint" "Paint App" 200
    Test-Endpoint "$baseUrl/apps/winamp" "Winamp App" 200
    Test-Endpoint "$baseUrl/apps/internet-explorer" "Internet Explorer App" 200
    Test-Endpoint "$baseUrl/apps/my-computer" "My Computer App" 200
    Test-Endpoint "$baseUrl/apps/invalid-app" "Invalid App (should 404)" 404

    # Тесты статических файлов
    Test-Endpoint "$baseUrl/static/css/style.css" "CSS Stylesheet" 200
    Test-Endpoint "$baseUrl/static/js/desktop.js" "Desktop JS" 200
    Test-Endpoint "$baseUrl/static/js/apps.js" "Apps JS" 200
    Test-Endpoint "$baseUrl/static/apps/config.json" "Config JSON" 200

    # Проверка конфигурации
    $configTest = Test-Endpoint "$baseUrl/api/config" "Config Validation" 200
    if ($configTest.Success) {
        try {
            $config = (Invoke-WebRequest -Uri "$baseUrl/api/config").Content | ConvertFrom-Json

            # Проверка структуры конфига
            if ($config.apps -and $config.desktopIcons -and $config.startMenuItems) {
                Write-Host "✅ Конфигурация имеет корректную структуру" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Конфигурация может иметь неполную структуру" -ForegroundColor Yellow
            }

            # Проверка количества приложений
            $appCount = ($config.apps | Get-Member -MemberType NoteProperty).Count
            Write-Host "📱 Найдено приложений: $appCount" -ForegroundColor Blue

        } catch {
            Write-Host "❌ Ошибка парсинга конфигурации" -ForegroundColor Red
        }
    }

} finally {
    if (!$NoServer) {
        Stop-TestServer
    }
}

# Показать результаты
$success = Show-TestResults

# Возврат кода выхода
if ($success) {
    exit 0
} else {
    exit 1
}
