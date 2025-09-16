# 🧪 TESTE SIMPLES DE APIs - SLOTBOX
# Execute: .\teste-apis-simples.ps1

Write-Host "🚀 INICIANDO TESTE SIMPLES DE APIs..." -ForegroundColor Green

$API_BASE = "https://slotbox-api.onrender.com"
$resultados = @()

# ===== TESTE 1: HEALTH CHECK =====
Write-Host "`n🌐 Testando Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check: OK ($($response.StatusCode))" -ForegroundColor Green
        $resultados += "✅ Health Check: OK"
    } else {
        Write-Host "❌ Health Check: $($response.StatusCode)" -ForegroundColor Red
        $resultados += "❌ Health Check: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Health Check: ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Health Check: ERRO"
}

# ===== TESTE 2: LISTA DE CAIXAS =====
Write-Host "`n📦 Testando Lista de Caixas..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/cases" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Lista de Caixas: OK ($($response.StatusCode))" -ForegroundColor Green
        $resultados += "✅ Lista de Caixas: OK"
    } else {
        Write-Host "❌ Lista de Caixas: $($response.StatusCode)" -ForegroundColor Red
        $resultados += "❌ Lista de Caixas: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Lista de Caixas: ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Lista de Caixas: ERRO"
}

# ===== TESTE 3: AUTH ME (SEM TOKEN) =====
Write-Host "`n🔐 Testando Auth Me (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/auth/me" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Auth Me (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Auth Me (sem token): OK"
    } else {
        Write-Host "⚠️ Auth Me (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Auth Me (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Auth Me (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Auth Me (sem token): ERRO"
}

# ===== TESTE 4: WALLET (SEM TOKEN) =====
Write-Host "`n💰 Testando Wallet (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/wallet/" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Wallet (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Wallet (sem token): OK"
    } else {
        Write-Host "⚠️ Wallet (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Wallet (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Wallet (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Wallet (sem token): ERRO"
}

# ===== TESTE 5: TRANSACTIONS (SEM TOKEN) =====
Write-Host "`n📊 Testando Transactions (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/transactions" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Transactions (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Transactions (sem token): OK"
    } else {
        Write-Host "⚠️ Transactions (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Transactions (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Transactions (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Transactions (sem token): ERRO"
}

# ===== TESTE 6: ADMIN STATS (SEM TOKEN) =====
Write-Host "`n👑 Testando Admin Stats (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/admin/dashboard/stats" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Admin Stats (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Admin Stats (sem token): OK"
    } else {
        Write-Host "⚠️ Admin Stats (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Admin Stats (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Admin Stats (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Admin Stats (sem token): ERRO"
}

# ===== TESTE 7: AFFILIATE ME (SEM TOKEN) =====
Write-Host "`n🤝 Testando Affiliate Me (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/affiliate/me" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Affiliate Me (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Affiliate Me (sem token): OK"
    } else {
        Write-Host "⚠️ Affiliate Me (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Affiliate Me (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Affiliate Me (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Affiliate Me (sem token): ERRO"
}

# ===== TESTE 8: PAYMENTS HISTORY (SEM TOKEN) =====
Write-Host "`n💳 Testando Payments History (sem token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/payments/history" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ Payments History (sem token): OK ($($response.StatusCode) - esperado)" -ForegroundColor Green
        $resultados += "✅ Payments History (sem token): OK"
    } else {
        Write-Host "⚠️ Payments History (sem token): $($response.StatusCode) (esperado 401)" -ForegroundColor Yellow
        $resultados += "⚠️ Payments History (sem token): $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Payments History (sem token): ERRO - $($_.Exception.Message)" -ForegroundColor Red
    $resultados += "❌ Payments History (sem token): ERRO"
}

# ===== RESUMO FINAL =====
Write-Host "`n📊 === RESUMO FINAL ===" -ForegroundColor Cyan

$sucessos = $resultados | Where-Object { $_ -like "✅*" }
$problemas = $resultados | Where-Object { $_ -like "❌*" }
$avisos = $resultados | Where-Object { $_ -like "⚠️*" }

Write-Host "✅ Sucessos: $($sucessos.Count)" -ForegroundColor Green
Write-Host "⚠️ Avisos: $($avisos.Count)" -ForegroundColor Yellow
Write-Host "❌ Problemas: $($problemas.Count)" -ForegroundColor Red

if ($problemas.Count -eq 0) {
    Write-Host "`n🎉 SISTEMA 100% FUNCIONAL!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ SISTEMA COM PROBLEMAS - VERIFICAR CORREÇÕES NECESSÁRIAS" -ForegroundColor Yellow
}

Write-Host "`n📋 Detalhes dos resultados:" -ForegroundColor Cyan
foreach ($resultado in $resultados) {
    Write-Host "  $resultado" -ForegroundColor White
}

Write-Host "`n🎯 TESTE CONCLUÍDO!" -ForegroundColor Green
