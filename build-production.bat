@echo off
echo ========================================
echo BUILD DE PRODUCAO - SLOT BOX
echo ========================================

echo.
echo [1/4] Limpando build anterior...
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo.
echo [2/4] Instalando dependencias do frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [3/4] Fazendo build de producao...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha no build
    pause
    exit /b 1
)

echo.
echo [4/4] Copiando arquivos para pasta de deploy...
cd ..
if exist "deploy-files" rmdir /s /q "deploy-files"
mkdir "deploy-files"
xcopy "frontend\dist\*" "deploy-files\" /E /I /Y

echo.
echo ========================================
echo BUILD CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Arquivos prontos para upload na Hostinger:
echo - Pasta: deploy-files\
echo - Upload para: public_html\
echo.
echo Arquivos principais:
echo - index.html
echo - assets\ (pasta com JS e CSS)
echo - imagens\ (pasta com imagens)
echo.
echo ========================================
pause
