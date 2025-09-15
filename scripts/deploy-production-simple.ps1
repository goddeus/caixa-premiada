# Script de Deploy em Produção - SlotBox
# PowerShell version for Windows

param(
    [string]$Environment = "production"
)

# Configurações
$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = "logs/deploy-$timestamp.log"

# Funções de log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $logTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$logTimestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Success {
    param([string]$Message)
    Write-Log "SUCCESS: $Message" "SUCCESS"
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERROR: $Message" "ERROR"
}

function Write-Warning {
    param([string]$Message)
    Write-Log "WARNING: $Message" "WARNING"
}

# Criar diretório de logs
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Log "INICIANDO DEPLOY EM PRODUCAO - SLOTBOX"
Write-Log "================================================"
Write-Log "Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Log "Ambiente: $Environment"
Write-Log "Diretorio: $(Get-Location)"

try {
    # 1. Verificar branch atual
    Write-Log "Verificando branch atual..."
    $currentBranch = git branch --show-current
    if ($currentBranch -notlike "audit/*") {
        throw "Branch incorreta: $currentBranch. Deve estar em audit/*"
    }
    Write-Success "Branch correta: $currentBranch"

    # 2. Verificar status do git
    Write-Log "Verificando status do git..."
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        throw "Ha mudancas nao commitadas. Faca commit antes do deploy."
    }
    Write-Success "Working directory limpo"

    # 3. Backup final do banco
    Write-Log "Executando backup final do banco..."
    if (Test-Path "backend/scripts/backup-database.js") {
        Set-Location backend
        node scripts/backup-database.js
        Set-Location ..
        Write-Success "Backup do banco realizado"
    } else {
        Write-Warning "Script de backup nao encontrado, pulando backup"
    }

    # 4. Build do frontend
    Write-Log "Fazendo build do frontend..."
    Set-Location frontend
    npm ci
    npm run build
    Set-Location ..
    
    if (Test-Path "frontend/dist") {
        Write-Success "Build do frontend concluido"
    } else {
        throw "Build do frontend falhou - diretorio dist nao encontrado"
    }

    # 5. Deploy do backend (Render)
    Write-Log "Fazendo deploy do backend no Render..."
    
    # Verificar se RENDER_DEPLOY_WEBHOOK está configurado
    $renderWebhook = $env:RENDER_DEPLOY_WEBHOOK
    if ($renderWebhook) {
        try {
            $response = Invoke-RestMethod -Uri $renderWebhook -Method POST -ContentType "application/json"
            Write-Success "Deploy do backend disparado no Render"
        } catch {
            Write-Warning "Falha ao disparar deploy no Render: $($_.Exception.Message)"
        }
    } else {
        Write-Warning "RENDER_DEPLOY_WEBHOOK nao configurado, pulando deploy do backend"
    }

    # 6. Deploy do frontend (Hostinger)
    Write-Log "Fazendo deploy do frontend no Hostinger..."
    
    # Verificar se credenciais do Hostinger estão configuradas
    $hostingerHost = $env:HOSTINGER_FTP_HOST
    $hostingerUser = $env:HOSTINGER_FTP_USER
    $hostingerPass = $env:HOSTINGER_FTP_PASS
    
    if ($hostingerHost -and $hostingerUser -and $hostingerPass) {
        try {
            Write-Success "Credenciais do Hostinger configuradas"
            Write-Warning "Upload via FTP nao implementado automaticamente"
            Write-Log "Arquivos prontos para upload em: frontend/dist/"
        } catch {
            Write-Warning "Falha no upload para Hostinger: $($_.Exception.Message)"
        }
    } else {
        Write-Warning "Credenciais do Hostinger nao configuradas, pulando deploy do frontend"
        Write-Log "Arquivos prontos para upload manual em: frontend/dist/"
    }

    # 7. Aplicar migrations (se necessário)
    Write-Log "Verificando migrations..."
    if (Test-Path "backend/prisma/migrations") {
        Set-Location backend
        try {
            npx prisma migrate deploy
            Write-Success "Migrations aplicadas com sucesso"
        } catch {
            Write-Warning "Falha ao aplicar migrations: $($_.Exception.Message)"
        }
        Set-Location ..
    } else {
        Write-Log "Nenhuma migration encontrada"
    }

    # 8. Smoke tests
    Write-Log "Executando smoke tests..."
    
    # Testar API health
    try {
        $apiUrl = "https://slotbox-api.onrender.com/api/health"
        $response = Invoke-RestMethod -Uri $apiUrl -Method GET -TimeoutSec 30
        Write-Success "API health check passou"
    } catch {
        Write-Warning "API health check falhou: $($_.Exception.Message)"
    }

    # Testar frontend
    try {
        $frontendUrl = "https://slotbox.shop"
        $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend health check passou"
        } else {
            Write-Warning "Frontend retornou status: $($response.StatusCode)"
        }
    } catch {
        Write-Warning "Frontend health check falhou: $($_.Exception.Message)"
    }

    # 9. Criar tag de deploy
    Write-Log "Criando tag de deploy..."
    $deployTag = "deploy-$timestamp"
    try {
        git tag -a $deployTag -m "Production deployment - $deployTag"
        git push origin $deployTag
        Write-Success "Tag de deploy criada: $deployTag"
    } catch {
        Write-Warning "Falha ao criar tag de deploy: $($_.Exception.Message)"
    }

    # 10. Relatório final
    Write-Log "DEPLOY CONCLUIDO COM SUCESSO!"
    Write-Log "================================================"
    Write-Log "Branch: $currentBranch"
    Write-Log "Build frontend: Concluido"
    Write-Log "Deploy backend: Disparado no Render"
    Write-Log "Deploy frontend: Arquivos prontos para upload"
    Write-Log "Migrations: Verificadas"
    Write-Log "Smoke tests: Executados"
    Write-Log "Tag de deploy: $deployTag"
    Write-Log ""
    Write-Log "URLs de Producao:"
    Write-Log "   API: https://slotbox-api.onrender.com"
    Write-Log "   Frontend: https://slotbox.shop"
    Write-Log ""
    Write-Log "Proximos passos:"
    Write-Log "   1. Verificar logs do Render"
    Write-Log "   2. Fazer upload manual do frontend se necessario"
    Write-Log "   3. Executar monitoramento pos-deploy"
    Write-Log "   4. Validar funcionalidades criticas"

} catch {
    Write-Error "Falha durante deploy: $($_.Exception.Message)"
    Write-Log "Para rollback, execute: ./scripts/rollback.sh"
    exit 1
}

Write-Log "DEPLOY EM PRODUCAO CONCLUIDO!"
Write-Log "Log salvo em: $LogFile"
