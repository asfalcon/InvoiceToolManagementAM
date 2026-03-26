@echo off
cd /d "%~dp0"
chcp 65001 >nul
title SA Financial Management

echo Comprobando dependencias...
if not exist node_modules (
    echo Instalando dependencias (solo la primera vez, puede tardar unos minutos)...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias.
        echo Asegurate de tener Node.js instalado: https://nodejs.org
        pause
        exit /b 1
    )
)

echo.
echo Iniciando SA Financial Management...
echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
node node_modules\tsx\dist\cli.mjs server/index.ts

pause
