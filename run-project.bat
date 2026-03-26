@echo off
cd /d "%~dp0"

echo =====================================================
echo  SA Financial Management - Launcher
echo =====================================================
echo.

:: ======= Instala dependencias si es necesario =======
if not exist node_modules (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERROR: Fallo al instalar dependencias.
        pause
        exit /b 1
    )
)

:: ======= Configura entorno =======
set NODE_ENV=development

echo Iniciando el servidor...
echo.

:: ======= Ejecuta servidor y captura errores =======
:: Se ejecuta en la misma ventana CMD
:: Redirige errores para que sean visibles
npx tsx server/index.ts 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Fallo al iniciar la aplicacion.
    pause
    exit /b 1
)

:: ======= Si el servidor arranca correctamente, abre navegador =======
:: Pausa unos segundos para dar tiempo al servidor a levantarse
timeout /t 3 >nul
start "" "http://localhost:5000"

echo.
echo La aplicacion se ha detenido.
pause
