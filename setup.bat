@echo off
if "%~1"=="" (
    start "SA Financial - Configuracion" cmd /k "%~f0" run
    exit /b
)
cd /d "%~dp0"

echo =====================================================
echo  SA Financial Management - Configuracion inicial
echo =====================================================
echo.
echo  Necesitas una base de datos PostgreSQL gratuita.
echo  Te recomendamos Neon (gratis, sin tarjeta^):
echo.
echo    1. Ve a: https://neon.tech
echo    2. Crea una cuenta gratuita
echo    3. Crea un nuevo proyecto
echo    4. Copia la "Connection string" que aparece
echo       (empieza por postgresql://...^)
echo.
pause

echo.
set /p DB_URL="Pega aqui tu connection string y pulsa Enter: "

echo.
echo Creando archivo .env...
(
echo DATABASE_URL=%DB_URL%
echo SESSION_SECRET=sa-finanzas-secret-%RANDOM%%RANDOM%
) > .env
echo Archivo .env creado.

echo.
echo Instalando dependencias (puede tardar unos minutos^)...
npm install

echo.
echo Creando tablas en la base de datos...
node node_modules\drizzle-kit\bin.cjs push

echo.
if errorlevel 1 (
    echo ERROR: No se pudieron crear las tablas.
    echo Comprueba que la connection string es correcta.
    echo Borra el archivo .env y vuelve a ejecutar setup.bat
) else (
    echo =====================================================
    echo  Configuracion completada con exito.
    echo  Ahora ejecuta run-project.bat para iniciar la app.
    echo =====================================================
)
echo.
