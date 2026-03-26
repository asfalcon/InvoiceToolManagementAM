@echo off
cd /d "%~dp0"
chcp 65001 >nul
title SA Financial Management

echo Iniciando SA Financial Management...
echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
call node node_modules\tsx\dist\cli.mjs server/index.ts

pause
