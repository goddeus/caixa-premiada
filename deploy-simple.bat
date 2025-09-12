@echo off
echo ==========================================
echo DEPLOY SIMPLES - FRONTEND
echo ==========================================

echo.
echo 🚀 Preparando deploy do frontend...

REM Limpar pasta anterior
if exist deploy-files rmdir /s /q deploy-files

REM Criar nova pasta
mkdir deploy-files

REM Copiar arquivos do build
echo 📁 Copiando arquivos do build...
xcopy /e /y dist\* deploy-files\

REM Copiar imagens
echo 🖼️ Copiando imagens...
xcopy /e /y public\imagens deploy-files\imagens\

echo.
echo ✅ Arquivos preparados em: deploy-files\
echo.
echo 📋 PROXIMOS PASSOS:
echo 1. Acesse o File Manager do Hostinger
echo 2. Vá para public_html
echo 3. Delete todos os arquivos antigos
echo 4. Upload da pasta 'deploy-files'
echo 5. Teste o site: https://slotbox.shop
echo.
echo 🎉 Deploy preparado com sucesso!
pause
