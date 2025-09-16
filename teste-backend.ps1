# Teste do backend em PowerShell
Write-Host "Testando backend..." -ForegroundColor Green

try {
    # Testar health check
    $response = Invoke-WebRequest -Uri "https://slotbox-api.onrender.com/api/health" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Resposta: $($response.Content)" -ForegroundColor Cyan
    
    # Testar rotas de compra
    Write-Host "Testando rotas de compra..." -ForegroundColor Green
    
    $compraResponse = Invoke-WebRequest -Uri "https://slotbox-api.onrender.com/api/compra/cases" -Method GET
    Write-Host "Rotas de compra - Status: $($compraResponse.StatusCode)" -ForegroundColor Yellow
    
    if ($compraResponse.StatusCode -eq 200) {
        Write-Host "Rotas de compra funcionando!" -ForegroundColor Green
    } else {
        Write-Host "Erro nas rotas de compra" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
}
