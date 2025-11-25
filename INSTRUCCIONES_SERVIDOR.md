# 🖥️ Instrucciones para Gestionar el Servidor

## 🔍 Problema: Servidor en Segundo Plano

Si el servidor se ejecuta en segundo plano y no puedes ver los logs, sigue estos pasos:

---

## 🛑 Detener Todos los Procesos de Node.js

### Opción 1: Usar el Script PowerShell (Recomendado)
```powershell
.\detener-servidor.ps1
```

### Opción 2: Comando Manual
```powershell
# Detener todos los procesos de Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Opción 3: Detener un Proceso Específico
```powershell
# Primero verifica qué proceso está usando el puerto 3000
.\verificar-puerto.ps1

# Luego detén el proceso específico (reemplaza PID con el número)
Stop-Process -Id <PID> -Force
```

---

## 🔍 Verificar Procesos Activos

### Ver todos los procesos de Node.js
```powershell
Get-Process node -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime
```

### Verificar qué está usando el puerto 3000
```powershell
.\verificar-puerto.ps1
```

O manualmente:
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

---

## ✅ Iniciar el Servidor Correctamente

### 1. Detén todos los procesos primero
```powershell
.\detener-servidor.ps1
```

### 2. Espera 2-3 segundos

### 3. Inicia el servidor
```powershell
npm start
```

### 4. Deberías ver los logs en la terminal:
```
✅ Registrando estrategia Google OAuth...
🚀 Server running on port 3000
```

---

## 🐛 Solución de Problemas

### Error: "Puerto 3000 ya está en uso"

1. **Verifica qué proceso lo está usando:**
   ```powershell
   .\verificar-puerto.ps1
   ```

2. **Detén el proceso:**
   ```powershell
   .\detener-servidor.ps1
   ```

3. **Espera unos segundos y vuelve a intentar:**
   ```powershell
   npm start
   ```

### El servidor no muestra logs

1. **Asegúrate de ejecutar `npm start` en la terminal de PowerShell**
2. **No uses `Start-Process node index.js`** (esto lo ejecuta en segundo plano)
3. **Usa siempre `npm start` directamente en la terminal**

### Múltiples instancias del servidor

Si hay múltiples instancias corriendo:

1. **Detén todas:**
   ```powershell
   Get-Process node | Stop-Process -Force
   ```

2. **Verifica que no queden procesos:**
   ```powershell
   Get-Process node -ErrorAction SilentlyContinue
   ```
   (No debería mostrar nada)

3. **Inicia solo una instancia:**
   ```powershell
   npm start
   ```

---

## 📋 Comandos Útiles

### Ver procesos de Node.js
```powershell
Get-Process node
```

### Detener todos los procesos de Node.js
```powershell
Get-Process node | Stop-Process -Force
```

### Verificar puerto 3000
```powershell
Get-NetTCPConnection -LocalPort 3000
```

### Matar proceso específico por PID
```powershell
Stop-Process -Id <PID> -Force
```

---

## 💡 Consejos

1. **Siempre detén el servidor con `Ctrl+C`** antes de cerrar la terminal
2. **Si cierras la terminal sin detener**, el proceso queda en segundo plano
3. **Usa `.\detener-servidor.ps1`** para limpiar procesos huérfanos
4. **Solo ejecuta UNA instancia del servidor** a la vez

---

## 🎯 Flujo Recomendado

```powershell
# 1. Detener procesos existentes
.\detener-servidor.ps1

# 2. Esperar 2-3 segundos

# 3. Iniciar servidor
npm start

# 4. Para detener, presiona Ctrl+C en la terminal donde está corriendo
```

