@echo off
cd /d "%~dp0"
chcp 65001 >nul
title S&A Financial Management

echo Iniciando S&A Financial Management...
echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
call npx tsx server/index.ts

pause
