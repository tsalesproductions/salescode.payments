@echo off
echo 🔄 Reiniciando servidor...

:: Parar processos Node.js relacionados ao projeto
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" ^| find "node.exe"') do (
    echo Parando processo %%i
    taskkill /pid %%i /f 2>nul
)

echo Aguardando 2 segundos...
timeout /t 2 /nobreak > nul

echo 🚀 Iniciando servidor...
cd /d "%~dp0"
npm run dev
