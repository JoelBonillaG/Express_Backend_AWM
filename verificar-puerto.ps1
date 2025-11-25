# Script para verificar qué está usando el puerto 3000
Write-Host "🔍 Verificando puerto 3000..." -ForegroundColor Cyan

$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port) {
    Write-Host "⚠️  El puerto 3000 está en uso" -ForegroundColor Red
    Write-Host "`n📋 Información del proceso:" -ForegroundColor Yellow
    
    $process = Get-Process -Id $port.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "   Nombre: $($process.ProcessName)" -ForegroundColor White
        Write-Host "   PID: $($process.Id)" -ForegroundColor White
        Write-Host "   Inicio: $($process.StartTime)" -ForegroundColor White
        Write-Host "`n💡 Para detener este proceso, ejecuta:" -ForegroundColor Cyan
        Write-Host "   Stop-Process -Id $($process.Id) -Force" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ El puerto 3000 está libre" -ForegroundColor Green
    Write-Host "   Puedes iniciar el servidor sin problemas" -ForegroundColor White
}

