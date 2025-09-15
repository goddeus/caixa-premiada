# Script simples para definir permissões corretas
Write-Host "🔧 Definindo permissões corretas..." -ForegroundColor Green

$distPath = "frontend\dist"

# Definir permissões para arquivos (644)
Get-ChildItem -Path $distPath -Recurse -File | ForEach-Object {
    $acl = Get-Acl $_.FullName
    $acl.SetAccessRuleProtection($false, $false)
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $_.FullName -AclObject $acl
    Write-Host "✅ Arquivo: $($_.Name)" -ForegroundColor Green
}

# Definir permissões para diretórios (755)
Get-ChildItem -Path $distPath -Recurse -Directory | ForEach-Object {
    $acl = Get-Acl $_.FullName
    $acl.SetAccessRuleProtection($false, $false)
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl -Path $_.FullName -AclObject $acl
    Write-Host "✅ Diretório: $($_.Name)" -ForegroundColor Green
}

Write-Host "🎯 Permissões definidas com sucesso!" -ForegroundColor Green
Write-Host "📋 Arquivos prontos para upload no Hostinger!" -ForegroundColor Cyan
