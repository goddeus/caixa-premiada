# Script para backup do banco de dados PostgreSQL
# Uso: .\scripts\backup-database.ps1

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$OutputDir = "backups"
)

# Criar diretório de backup se não existir
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
}

# Gerar timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = "$OutputDir/db_before_audit_$timestamp.sql"

Write-Host "Iniciando backup do banco de dados..."
Write-Host "Database URL: $DatabaseUrl"
Write-Host "Arquivo de backup: $backupFile"

try {
    # Extrair componentes da URL do banco
    if ($DatabaseUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
        $username = $matches[1]
        $password = $matches[2]
        $host = $matches[3]
        $port = $matches[4]
        $database = $matches[5]
        
        Write-Host "Host: $host"
        Write-Host "Port: $port"
        Write-Host "Database: $database"
        Write-Host "Username: $username"
        
        # Definir variável de ambiente para senha
        $env:PGPASSWORD = $password
        
        # Executar pg_dump
        $pgDumpCmd = "pg_dump -h $host -p $port -U $username -d $database --no-password --verbose --clean --if-exists --create"
        
        Write-Host "Executando: $pgDumpCmd"
        
        # Redirecionar saída para arquivo
        Invoke-Expression "$pgDumpCmd > `"$backupFile`" 2>&1"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Backup concluído com sucesso: $backupFile"
            
            # Verificar tamanho do arquivo
            $fileSize = (Get-Item $backupFile).Length
            Write-Host "Tamanho do arquivo: $([math]::Round($fileSize/1MB, 2)) MB"
        } else {
            Write-Error "Erro ao executar pg_dump. Código de saída: $LASTEXITCODE"
            exit 1
        }
    } else {
        Write-Error "Formato inválido da DATABASE_URL"
        exit 1
    }
} catch {
    Write-Error "Erro durante o backup: $($_.Exception.Message)"
    exit 1
} finally {
    # Limpar variável de ambiente
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Backup finalizado!"
