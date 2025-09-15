# Script para backup dos assets/imagens
# Uso: .\scripts\backup-assets.ps1

param(
    [string]$SourceDir = "frontend/public/imagens",
    [string]$OutputDir = "backups"
)

# Gerar timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$OutputDir/assets_before_audit_$timestamp.zip"

Write-Host "Iniciando backup dos assets..."
Write-Host "Diretório fonte: $SourceDir"
Write-Host "Arquivo de backup: $backupFile"

# Verificar se o diretório fonte existe
if (!(Test-Path $SourceDir)) {
    Write-Error "Diretório fonte não encontrado: $SourceDir"
    exit 1
}

# Criar diretório de backup se não existir
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
}

try {
    # Criar arquivo ZIP com todos os assets
    Write-Host "Comprimindo assets..."
    
    # Usar Compress-Archive do PowerShell
    Compress-Archive -Path "$SourceDir\*" -DestinationPath $backupFile -Force
    
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length
        Write-Host "Backup de assets concluído com sucesso: $backupFile"
        Write-Host "Tamanho do arquivo: $([math]::Round($fileSize/1MB, 2)) MB"
        
        # Listar arquivos incluídos
        $zip = [System.IO.Compression.ZipFile]::OpenRead($backupFile)
        $fileCount = $zip.Entries.Count
        Write-Host "Número de arquivos incluídos: $fileCount"
        $zip.Dispose()
    } else {
        Write-Error "Falha ao criar arquivo de backup"
        exit 1
    }
} catch {
    Write-Error "Erro durante o backup dos assets: $($_.Exception.Message)"
    exit 1
}

Write-Host "Backup de assets finalizado!"
