@echo off
echo ========================================
echo  FRONTEND - DEPLOY PARA HOSTINGER
echo ========================================
echo.

echo [1/4] Criando arquivo .env...
echo VITE_API_URL=https://slotbox-api.onrender.com/api > .env

echo [2/4] Instalando dependencias...
call npm install

echo [3/4] Gerando build de producao...
call npm run build

echo [4/4] Build concluido!
echo.
echo ========================================
echo  INSTRUCOES FINAIS:
echo ========================================
echo 1. Acesse o File Manager da Hostinger
echo 2. Faca upload de TODOS os arquivos da pasta 'dist'
echo 3. Certifique-se que index.html esta na raiz do dominio
echo 4. Teste: https://slotbox.shop
echo ========================================
echo.
pause
