@echo off
echo ===================================================
echo      INSTALADOR DE DEPENDENCIAS DO CADERNINHO
echo ===================================================
echo.

REM Verifica se o Node.js está instalado
echo Verificando a presenca do Node.js...
node -v >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado.
    echo Por favor, instale o Node.js (versao recomendada: v24.4.1) antes de continuar.
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

REM Instala as dependências do Backend
echo --- Instalando dependencias do Backend ---
cd caderninho-backend
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do Backend.
    pause
    exit /b 1
)
echo Dependencias do Backend instaladas com sucesso!
echo.
cd ..

REM Instala as dependências do Frontend
echo --- Instalando dependencias do Frontend ---
cd caderninho-frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias do Frontend.
    pause
    exit /b 1
)
echo Dependencias do Frontend instaladas com sucesso!
echo.
cd ..

echo ===================================================
echo      INSTALACAO CONCLUIDA COM SUCESSO!
echo ===================================================
echo.
echo Para iniciar o projeto, abra dois terminais:
echo 1. Rode 'npm run server' na pasta 'caderninho-backend'
echo 2. Rode 'npm run dev' na pasta 'caderninho-frontend'
echo.
pause