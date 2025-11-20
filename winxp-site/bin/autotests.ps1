# Простой автотест Windows XP Desktop
# Запускает сервер, тестирует основные endpoints

Write-Host "🚀 Автотест Windows XP Desktop" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$serverPid = $null
$passed = 0
$failed = 0

function Start-TestServer {
    Write-Host "🔧 Запуск сервера..." -ForegroundColor Blue
    $job = Start-Job -ScriptBlock {
        param($ProjectPath)
        Set-Location $ProjectPath
        cargo run > $null 2>&1
    } -ArgumentList (Get-Location).Path
    $script:serverPid = $job.Id
    Start-Sleep -Seconds 8
}

function Stop-TestServer {
    if ($script:serverPid) {
        Stop-Job -Id $script:serverPid -ErrorAction SilentlyContinue
        Remove-Job -Id $script:serverPid -ErrorAction SilentlyContinue
    }
}

function Test-Endpoint {
    param([string]$Url, [string]$Name, [int]$ExpectedCode = 200)

    Write-Host "📡 Тестирую: $Name..." -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5
        if ($response.StatusCode -eq $ExpectedCode) {
            Write-Host " ✅" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host " ❌ (код $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
        }
    } catch {
        Write-Host " ❌ (ошибка)" -ForegroundColor Red
        $script:failed++
    }
}

# Запуск сервера
Start-TestServer

# Тесты
Write-Host "`n🧪 Запуск тестов:" -ForegroundColor Yellow

Test-Endpoint "$baseUrl/health" "Health Check"
Test-Endpoint "$baseUrl/api/config" "Configuration API"
Test-Endpoint "$baseUrl/api/apps" "Apps List API"
Test-Endpoint "$baseUrl/" "Главная страница"
Test-Endpoint "$baseUrl/apps/minesweeper" "Minesweeper App"
Test-Endpoint "$baseUrl/apps/notepad" "Notepad App"
Test-Endpoint "$baseUrl/apps/paint" "Paint App"
Test-Endpoint "$baseUrl/apps/winamp" "Winamp App"
Test-Endpoint "$baseUrl/apps/internet-explorer" "Internet Explorer App"
Test-Endpoint "$baseUrl/apps/my-computer" "My Computer App"
Test-Endpoint "$baseUrl/apps/invalid-app" "Invalid App" 404
Test-Endpoint "$baseUrl/static/css/style.css" "CSS Stylesheet"
Test-Endpoint "$baseUrl/static/js/desktop.js" "Desktop JS"

# Остановка сервера
Stop-TestServer

# Результаты
Write-Host "`n📊 Результаты:" -ForegroundColor Cyan
Write-Host "Всего тестов: $(($passed + $failed))"
Write-Host "Пройдено: $passed" -ForegroundColor Green
Write-Host "Провалено: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "`n🎉 Все тесты пройдены успешно!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Некоторые тесты провалены." -ForegroundColor Red
    exit 1
}