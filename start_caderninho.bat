@echo off
title Caderninho - Inicializador
color 0A

echo.
echo =========================================================
echo == INICIANDO SERVIDORES DO CADERNINHO ==================
echo =========================================================
echo.
echo 1. Iniciando BACKEND (Servidor Node.js)...
start cmd /k "cd caderninho-backend && node index.js"

rem Aguarda 10 segundos para o Backend iniciar e conectar ao DB
timeout /t 10 >nul

echo.
echo 2. Iniciando FRONTEND (Aplicativo React)...
start cmd /k "cd caderninho-frontend && npm run dev"

rem Aguarda 8 segundos para o Frontend compilar e ficar pronto
timeout /t 8 >nul

echo.
echo =========================================================
echo == SERVIDORES INICIADOS! ================================
echo =========================================================
echo.
echo *********************************************************
echo * ABRE O NAVEGADOR: http://localhost:5173/              *
echo *********************************************************
echo.

explorer.exe "http://localhost:5173/" REM <<-- ABRE O NAVEGADOR

echo.
echo Se o navegador nao abrir, verifique:
echo 1. Seus servidores estao rodando (janelas de terminal abertas).
echo 2. Antivirus ou Firewall pode estar bloqueando a abertura.
echo    Tente desabilitar temporariamente e retestar.
echo 3. Acesse manualmente: http://localhost:5173/
echo.
echo Pressione qualquer tecla para fechar esta janela de inicializacao...
pause >nul
exit