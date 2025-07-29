@echo off
title Configurar Caderninho
color 0B

echo.
echo =========================================================
echo == INICIADOR DE CONFIGURACAO DO SISTEMA CADERNINHO ======
echo =========================================================
echo.
echo Certifique-se de ter o Node.js e o npm instalados (LTS recomendado).
echo.
echo Este script ira instalar as dependencias do Backend e do Frontend.
echo.
pause
cls

echo =========================================================
echo == INSTALANDO DEPENDENCIAS DO BACKEND ==================
echo =========================================================
echo.
cd caderninho-backend
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: A instalacao das dependencias do Backend falhou!
    echo Verifique a conexao com a internet e se ha erros no log acima.
    pause
    exit /b %ERRORLEVEL%
)
echo Backend: Dependencias instaladas com sucesso!
echo.
cd ..

echo =========================================================
echo == INSTALANDO DEPENDENCIAS DO FRONTEND =================
echo =========================================================
echo.
cd caderninho-frontend
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: A instalacao das dependencias do Frontend falhou!
    echo Verifique a conexao com a internet e se ha erros no log acima.
    pause
    exit /b %ERRORLEVEL%
)
echo Frontend: Dependencias instaladas com sucesso!
echo.
cd ..

cls
echo.
echo =========================================================
echo == CONFIGURACAO INICIAL QUASE CONCLUIDA! ==============
echo =========================================================
echo.
echo 1. PASSO CRITICO: CONFIGURAR O ARQUIVO .ENV DO BACKEND:
echo    - Abra a pasta "caderninho-backend".
echo    - Localize o arquivo ".env" (se nao existir, crie-o).
echo    - Edite-o com sua string de conexao do MongoDB Atlas (MONGO_URI)
echo      e uma chave secreta JWT (JWT_SECRET) para seguranca.
echo      Ex: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/caderninhoDB
echo          JWT_SECRET=sua_chave_secreta_aqui
echo.
echo 2. Para TESTAR LOCALMENTE:
echo    - Abra a pasta "caderninho-frontend".
echo    - Localize o arquivo ".env" (se nao existir, crie-o).
echo    - Edite-o com: VITE_API_BASE_URL=http://localhost:4000
echo.
echo 3. Para TESTAR EM CELULAR/REDE LOCAL:
echo    - Encontre o IPV4 do seu computador (ipconfig no CMD).
echo    - Edite o ".env" do Frontend com: VITE_API_BASE_URL=http://SEU_IP_AQUI:4000
echo    - Configure o Firewall do Windows para as portas 4000 e 5173.
echo.
echo =========================================================
echo == SETUP CONCLUIDO! ====================================
echo =========================================================
echo.
echo Agora, para INICIAR o sistema, de um duplo clique no arquivo:
echo "start_caderninho.bat"
echo (Na pasta raiz do projeto)
echo.
pause
exit