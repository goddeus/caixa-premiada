@echo off
echo ==========================================
echo SCRIPT DE DEPLOY PARA PRODUCAO
echo ==========================================

echo.
echo 🚀 Iniciando deploy para producao...

REM 1. Backup do banco de dados atual
echo.
echo 📦 Fazendo backup do banco de dados...
cd backend
node export-database.js
cd ..

REM 2. Build do frontend
echo.
echo 🔨 Fazendo build do frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Erro no build do frontend!
    pause
    exit /b 1
)
echo ✅ Frontend buildado com sucesso!

REM 3. Preparar arquivos para upload
echo.
echo 📁 Preparando arquivos para upload...
if exist deploy-files rmdir /s /q deploy-files
mkdir deploy-files
xcopy /e /i dist deploy-files
xcopy /e /i public\imagens deploy-files\imagens

REM 4. Criar arquivo de configuração para Hostinger
echo.
echo ⚙️ Criando configuração para Hostinger...
echo RewriteEngine On > deploy-files\.htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-f >> deploy-files\.htaccess
echo RewriteCond %%{REQUEST_FILENAME} !-d >> deploy-files\.htaccess
echo RewriteRule ^(.*)$ index.html [QSA,L] >> deploy-files\.htaccess
echo. >> deploy-files\.htaccess
echo # Compressão >> deploy-files\.htaccess
echo ^<IfModule mod_deflate.c^> >> deploy-files\.htaccess
echo     AddOutputFilterByType DEFLATE text/plain >> deploy-files\.htaccess
echo     AddOutputFilterByType DEFLATE text/html >> deploy-files\.htaccess
echo     AddOutputFilterByType DEFLATE text/css >> deploy-files\.htaccess
echo     AddOutputFilterByType DEFLATE application/javascript >> deploy-files\.htaccess
echo ^</IfModule^> >> deploy-files\.htaccess

echo.
echo ✅ Arquivos preparados em: deploy-files\
echo.
echo 📋 PROXIMOS PASSOS:
echo 1. Faca upload da pasta 'deploy-files' para o Hostinger
echo 2. Configure o banco PostgreSQL no Hostinger
echo 3. Configure as variaveis de ambiente no Render
echo 4. Configure o VizzionPay com as chaves reais
echo.
echo 🎉 Deploy preparado com sucesso!
pause
