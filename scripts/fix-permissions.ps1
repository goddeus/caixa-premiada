# Script para corrigir permissões dos arquivos do frontend
Write-Host "🔧 Corrigindo permissões dos arquivos do frontend..." -ForegroundColor Green

$distPath = "frontend\dist"

# Verificar se o diretório existe
if (-not (Test-Path $distPath)) {
    Write-Host "❌ Diretório $distPath não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Diretório encontrado: $distPath" -ForegroundColor Yellow

# Função para definir permissões
function Set-FilePermissions {
    param(
        [string]$Path,
        [string]$Type
    )
    
    try {
        if ($Type -eq "file") {
            # Arquivos: 644 (rw-r--r--)
            $acl = Get-Acl $Path
            $acl.SetAccessRuleProtection($false, $false)
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "Allow")
            $acl.SetAccessRule($accessRule)
            Set-Acl -Path $Path -AclObject $acl
            Write-Host "✅ Arquivo: $Path" -ForegroundColor Green
        } elseif ($Type -eq "directory") {
            # Diretórios: 755 (rwxr-xr-x)
            $acl = Get-Acl $Path
            $acl.SetAccessRuleProtection($false, $false)
            $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
            $acl.SetAccessRule($accessRule)
            Set-Acl -Path $Path -AclObject $acl
            Write-Host "✅ Diretório: $Path" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Erro ao definir permissões para $Path : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Corrigir permissões de todos os arquivos
Write-Host "📄 Corrigindo permissões dos arquivos..." -ForegroundColor Yellow
Get-ChildItem -Path $distPath -Recurse -File | ForEach-Object {
    Set-FilePermissions -Path $_.FullName -Type "file"
}

# Corrigir permissões de todos os diretórios
Write-Host "📁 Corrigindo permissões dos diretórios..." -ForegroundColor Yellow
Get-ChildItem -Path $distPath -Recurse -Directory | ForEach-Object {
    Set-FilePermissions -Path $_.FullName -Type "directory"
}

# Corrigir permissões do diretório raiz
Set-FilePermissions -Path $distPath -Type "directory"

Write-Host "🎯 Permissões corrigidas com sucesso!" -ForegroundColor Green
Write-Host "📋 Resumo das permissões:" -ForegroundColor Cyan
Write-Host "   - Arquivos: 644 (rw-r--r--)" -ForegroundColor White
Write-Host "   - Diretórios: 755 (rwxr-xr-x)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Arquivos prontos para upload no Hostinger!" -ForegroundColor Green
