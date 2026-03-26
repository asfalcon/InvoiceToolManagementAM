@echo off
if "%~1"=="" (
    start "SA Financial Management" cmd /k "%~f0" run
    exit /b
)
cd /d "%~dp0"

echo =====================================================
echo  SA Financial Management
echo =====================================================
echo.

if not exist node_modules (
    echo Instalando dependencias (solo la primera vez^)...
    npm install
    echo.
)

if not exist .env (
    echo ERROR: No se encontro el archivo .env
    echo Ejecuta primero setup.bat para configurar la base de datos.
    echo.
    goto fin
)

echo Sincronizando base de datos...
node node_modules\drizzle-kit\bin.cjs push
echo.

echo Abre tu navegador en: http://localhost:5000
echo Para cerrar la aplicacion, cierra esta ventana.
echo.

set NODE_ENV=development
node node_modules\tsx\dist\cli.mjs server/index.ts

echo.
echo La aplicacion se ha detenido.
:fin
echo.
