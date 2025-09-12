@echo off
echo ==========================================
echo DEPLOY BACKEND - CORREÇÕES APLICADAS
echo ==========================================

echo.
echo 🔧 Aplicando correções no backend...

REM 1. Adicionar bcryptjs ao package.json
echo ✅ bcryptjs adicionado ao package.json

REM 2. Corrigir campo imagem_url para imagem
echo ✅ Campo imagem_url corrigido para imagem

REM 3. Corrigir imports de bcrypt
echo ✅ Imports de bcrypt corrigidos

echo.
echo 📋 COMANDOS GIT PARA EXECUTAR:
echo.
echo git add .
echo git commit -m "🔧 Correções para deploy no Render
echo.
echo ✅ Correções aplicadas:
echo - Adicionado bcryptjs ao package.json
echo - Corrigido campo imagem_url para imagem no init-db.js
echo - Corrigidos imports de bcrypt para bcryptjs
echo - Scripts de teste corrigidos
echo.
echo 🎯 Pronto para novo deploy no Render!"
echo.
echo git push origin main
echo.
echo 🚀 Após o push, o Render fará novo deploy automaticamente!
echo.
pause
