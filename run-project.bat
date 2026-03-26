@echo off
cd /d "%~dp0"

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
)

echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
node node_modules\tsx\dist\cli.mjs server/index.ts

echo.
echo La aplicacion se ha detenido.
cmd /k
