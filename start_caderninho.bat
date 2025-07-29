@echo off
title Iniciar Caderninho
color 0A

echo.
echo =========================================================
echo == INICIANDO O SISTEMA CADERNINHO ======================
echo =========================================================
echo.
echo 1. Iniciando o servidor BACKEND (Node.js)...
echo    Por favor, aguarde a mensagem: "Conectado com sucesso ao MongoDB Atlas!"
echo    Isso pode levar alguns segundos.
echo.

start cmd /k "cd caderninho-backend && node index.js && exit"

rem Aguarda um tempo para o backend iniciar e conectar ao DB (aumentado para 10s)
timeout /t 10 >nul

echo.
echo 2. Iniciando o servidor FRONTEND (Aplicativo React)...
echo.

start cmd /k "cd caderninho-frontend && npm run dev && exit"

echo.
echo =========================================================
echo == CADERNINHO INICIADO! =================================
echo =========================================================
echo.
echo *********************************************************
echo * ACESSE O SISTEMA NO SEU NAVEGADOR:                    *
echo * Desenvolvimento local: http://localhost:5173/       *
echo * Teste em celular (IP local): http://SEU_IP_AQUI:5173/ *
echo *********************************************************
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
exit