@echo off
cd /d "%~dp0"
chcp 65001 >nul
title SA Financial - Configuracion inicial
color 0A

echo.
echo  =====================================================
echo   S^&A Financial Management - Configuracion inicial
echo  =====================================================
echo.
echo  Este asistente creara el archivo .env y preparara
echo  la base de datos automaticamente.
echo.
echo  Necesitas una base de datos PostgreSQL gratuita.
echo  Te recomendamos Neon (gratis, sin tarjeta):
echo.
echo    1. Ve a: https://neon.tech
echo    2. Crea una cuenta gratuita
echo    3. Crea un nuevo proyecto
echo    4. Copia la "Connection string" que aparece
echo       (empieza por postgresql://...)
echo.
pause

echo.
set /p DB_URL="Pega aqui tu connection string y pulsa Enter: "

echo.
echo  Creando archivo .env...

(
echo DATABASE_URL=%DB_URL%
echo SESSION_SECRET=sa-finanzas-secret-%RANDOM%%RANDOM%
) > .env

echo  Archivo .env creado correctamente.
echo.
echo  Creando tablas en la base de datos...
node node_modules\drizzle-kit\bin.cjs push

if %errorlevel% neq 0 (
    echo.
    echo  ERROR: No se pudieron crear las tablas.
    echo  Comprueba que la connection string es correcta.
    echo  Borra el archivo .env y vuelve a ejecutar setup.bat
    pause
    exit /b 1
)

echo.
echo  =====================================================
echo   Configuracion completada con exito!
echo  =====================================================
echo.
echo  Ahora puedes usar run-project.bat para arrancar
echo  la aplicacion en cualquier momento.
echo.
pause
