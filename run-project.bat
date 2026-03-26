@echo off
cd /d "%~dp0"
chcp 65001 >nul
title SA Financial Management

echo =====================================================
echo  SA Financial Management
echo =====================================================
echo.

if not exist node_modules (
    echo Instalando dependencias (solo la primera vez)...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Fallo al instalar dependencias.
        echo Asegurate de tener Node.js instalado: https://nodejs.org
        echo.
        cmd /k
        exit /b 1
    )
    echo.
)

if not exist .env (
    echo ERROR: No se encontro el archivo .env
    echo Ejecuta primero setup.bat para configurar la base de datos.
    echo.
    cmd /k
    exit /b 1
)

echo Sincronizando base de datos...
node node_modules\drizzle-kit\bin.cjs push
if errorlevel 1 (
    echo.
    echo ERROR: No se pudo conectar a la base de datos.
    echo Comprueba que la connection string en el archivo .env es correcta.
    echo.
    cmd /k
    exit /b 1
)

echo.
echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
node node_modules\tsx\dist\cli.mjs server/index.ts

echo.
echo La aplicacion se ha detenido.
cmd /k
