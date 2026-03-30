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

set NODE_ENV=development
start "" /b node node_modules\tsx\dist\cli.mjs server/index.ts

echo Esperando que el servidor arranque...
timeout /t 3 /nobreak >nul

start "" http://localhost:5000

echo Servidor corriendo en http://localhost:5000
echo Cierra esta ventana para detener la aplicacion.
echo.

:fin
