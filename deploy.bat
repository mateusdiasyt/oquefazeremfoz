@echo off
echo 🚀 Iniciando deploy automático...
echo.

REM Tentar encontrar Git em vários locais
set "GIT_PATH="
if exist "C:\Program Files\Git\bin\git.exe" (
    set "GIT_PATH=C:\Program Files\Git\bin\git.exe"
) else if exist "C:\Program Files (x86)\Git\bin\git.exe" (
    set "GIT_PATH=C:\Program Files (x86)\Git\bin\git.exe"
) else (
    echo ❌ Git não encontrado. Por favor, reinicie o terminal após instalar o Git.
    pause
    exit /b 1
)

echo ✅ Git encontrado
echo.

REM Verificar se é repositório Git
if not exist ".git" (
    echo 📦 Inicializando repositório Git...
    "%GIT_PATH%" init
    "%GIT_PATH%" remote add origin https://github.com/mateusdiasyt/oquefazeremfoz.git 2>nul
    if errorlevel 1 (
        "%GIT_PATH%" remote set-url origin https://github.com/mateusdiasyt/oquefazeremfoz.git
    )
    echo ✅ Repositório inicializado
    echo.
)

REM Adicionar arquivos
echo 📝 Adicionando arquivos modificados...
"%GIT_PATH%" add .

REM Fazer commit
echo 💾 Fazendo commit das alterações...
"%GIT_PATH%" commit -m "Corrigir erro 500 ao seguir empresa - melhorias no tratamento de erros e validações"

if errorlevel 1 (
    echo ❌ Erro ao fazer commit
    pause
    exit /b 1
)

REM Fazer push
echo 📤 Enviando alterações para o GitHub...
"%GIT_PATH%" push -u origin main

if errorlevel 1 (
    echo ⚠️  Tentando com branch 'master'...
    "%GIT_PATH%" push -u origin master
)

if errorlevel 1 (
    echo ❌ Erro ao fazer push. Verifique suas credenciais do GitHub.
    pause
    exit /b 1
)

echo.
echo ✅ Deploy concluído com sucesso!
echo 🌐 O Vercel fará o deploy automático em alguns instantes.
echo 📊 Acompanhe em: https://vercel.com
echo.
pause
