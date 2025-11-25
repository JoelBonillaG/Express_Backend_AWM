# Script para detener todos los procesos de Node.js
Write-Host "🔍 Buscando procesos de Node.js..." -ForegroundColor Yellow

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "📋 Procesos encontrados:" -ForegroundColor Cyan
    $nodeProcesses | Format-Table Id, ProcessName, StartTime -AutoSize
    
    Write-Host "`n🛑 Deteniendo procesos de Node.js..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ Todos los procesos de Node.js han sido detenidos" -ForegroundColor Green
} else {
    Write-Host "✅ No hay procesos de Node.js corriendo" -ForegroundColor Green
}

# Verificar si el puerto 3000 está en uso
Write-Host "`n🔍 Verificando puerto 3000..." -ForegroundColor Yellow
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($port) {
    Write-Host "⚠️  El puerto 3000 está en uso" -ForegroundColor Red
    Write-Host "   PID: $($port.OwningProcess)" -ForegroundColor Yellow
} else {
    Write-Host "✅ El puerto 3000 está libre" -ForegroundColor Green
}

Write-Host "`n💡 Ahora puedes ejecutar: npm start" -ForegroundColor Cyan

