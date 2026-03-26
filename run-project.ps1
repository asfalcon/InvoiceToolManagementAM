Set-Location $PSScriptRoot

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  SA Financial Management" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias (solo la primera vez)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Fallo al instalar dependencias." -ForegroundColor Red
        Write-Host "Asegurate de tener Node.js instalado: https://nodejs.org" -ForegroundColor Red
        Read-Host "Pulsa Enter para salir"
        exit 1
    }
}

Write-Host "Abre tu navegador en: http://localhost:5000" -ForegroundColor Green
Write-Host "Para cerrar la aplicacion, pulsa Ctrl+C o cierra esta ventana."
Write-Host ""

$env:NODE_ENV = "development"
node node_modules\tsx\dist\cli.mjs server/index.ts

Write-Host ""
Write-Host "La aplicacion se ha detenido." -ForegroundColor Yellow
Read-Host "Pulsa Enter para salir"
