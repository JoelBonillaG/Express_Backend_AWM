# 🔄 Flujo Completo de OAuth 2.0

Este documento explica cómo funciona el flujo de autenticación OAuth 2.0 en esta aplicación.

---

## 📋 Resumen del Flujo

El flujo OAuth permite que los usuarios se autentiquen usando su cuenta de Google o GitHub sin necesidad de crear una contraseña en tu aplicación.

---

## 🔵 Flujo de Google OAuth

### Paso 1: Usuario inicia el proceso
```
Usuario → Navegador → GET /auth/google
```

El usuario hace clic en un botón o visita directamente:
```
http://localhost:3000/auth/google
```

### Paso 2: Redirección a Google
```
Tu Backend → Google OAuth Server
```

Tu aplicación redirige al usuario a Google con:
- **Client ID**: Tu identificador de aplicación
- **Scopes**: `['profile', 'email']` - Permisos que solicitas
- **Callback URL**: `http://localhost:3000/auth/google/callback`

El usuario ve la pantalla de Google pidiendo autorización.

### Paso 3: Usuario autoriza en Google
```
Usuario → Autoriza en Google → Google genera código de autorización
```

El usuario:
1. Inicia sesión en Google (si no está logueado)
2. Ve qué permisos está solicitando tu app
3. Hace clic en "Permitir" o "Autorizar"

### Paso 4: Google redirige de vuelta
```
Google → GET /auth/google/callback?code=AUTHORIZATION_CODE
```

Google redirige al usuario de vuelta a tu aplicación con:
- Un **código de autorización** en la URL
- Este código es temporal y solo se puede usar una vez

### Paso 5: Backend intercambia código por tokens
```
Tu Backend → Google OAuth Server (intercambio silencioso)
```

Tu backend (usando Passport):
1. Recibe el código de autorización
2. Lo intercambia con Google por un **access token**
3. Usa el access token para obtener el perfil del usuario
4. Google devuelve información del usuario:
   ```json
   {
     "id": "123456789",
     "displayName": "Josué García",
     "emails": [{"value": "josuegarcab2@hotmail.com"}]
   }
   ```

### Paso 6: Procesamiento del perfil
```
Passport Strategy → UserRepository → AuthService
```

Tu aplicación:
1. **Busca** si ya existe un usuario con ese email
2. Si **NO existe**:
   - Crea un nuevo usuario con:
     - Email del perfil de Google
     - Nombre del perfil
     - `oauthProvider: 'google'`
     - `oauthId: '123456789'` (ID de Google)
     - Contraseña aleatoria (no se usará)
3. Si **SÍ existe**:
   - Actualiza el usuario con la información OAuth
   - Vincula la cuenta con Google

### Paso 7: Generación de tokens JWT
```
AuthService → Genera Access Token y Refresh Token
```

Tu aplicación genera tokens JWT para el usuario:
- **Access Token**: Válido por 15 minutos (configurable)
- **Refresh Token**: Válido por 7 días (configurable)

### Paso 8: Redirección con tokens
```
Backend → GET /auth/oauth/success?accessToken=...&refreshToken=...
```

El usuario es redirigido a una página de éxito con los tokens en la URL.

### Paso 9: Usuario obtiene tokens
```
Usuario → Ve tokens en la respuesta JSON
```

El usuario recibe:
```json
{
  "success": true,
  "message": "Autenticación OAuth exitosa",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_aqui"
  }
}
```

---

## 🔄 Diagrama de Flujo Completo

```
┌─────────┐
│ Usuario │
└────┬────┘
     │
     │ 1. GET /auth/google
     ▼
┌─────────────────┐
│   Tu Backend    │
│  (Express App)  │
└────┬────────────┘
     │
     │ 2. Redirige a Google
     ▼
┌─────────────────┐
│  Google OAuth   │
│     Server      │
└────┬────────────┘
     │
     │ 3. Usuario autoriza
     │
     │ 4. Redirige con código
     ▼
┌─────────────────┐
│   Tu Backend    │
│ /google/callback│
└────┬────────────┘
     │
     │ 5. Intercambia código
     │    por access token
     ▼
┌─────────────────┐
│  Google OAuth   │
│     Server      │
└────┬────────────┘
     │
     │ 6. Devuelve perfil
     ▼
┌─────────────────┐
│ Passport Strategy│
│  (passport.js)  │
└────┬────────────┘
     │
     │ 7. Busca/Crea usuario
     ▼
┌─────────────────┐
│ UserRepository  │
└────┬────────────┘
     │
     │ 8. Genera tokens JWT
     ▼
┌─────────────────┐
│  AuthService    │
└────┬────────────┘
     │
     │ 9. Redirige con tokens
     ▼
┌─────────┐
│ Usuario │
│ (tokens)│
└─────────┘
```

---

## 🔑 Componentes Clave

### 1. **Passport.js** (`config/passport.js`)
- Registra las estrategias OAuth (Google, GitHub)
- Maneja el intercambio de código por tokens
- Obtiene el perfil del usuario del proveedor OAuth
- Llama al callback con el perfil del usuario

### 2. **Rutas OAuth** (`routes/authRoutes.js`)
- `/auth/google` - Inicia el flujo OAuth
- `/auth/google/callback` - Recibe el código y procesa
- `/auth/oauth/success` - Muestra los tokens

### 3. **Controlador** (`controllers/AuthController.js`)
- `googleCallback()` - Procesa el usuario autenticado
- Genera tokens JWT
- Redirige con los tokens

### 4. **Servicio de Autenticación** (`services/AuthService.js`)
- `generateAccessToken()` - Crea JWT de acceso
- `generateRefreshToken()` - Crea refresh token

### 5. **Repositorio de Usuarios** (`repositories/UserRepository.js`)
- `findByEmail()` - Busca usuario existente
- `create()` - Crea nuevo usuario OAuth
- `update()` - Actualiza información OAuth

---

## 🔐 Seguridad y Tokens

### Access Token (JWT)
- **Contiene**: ID del usuario, email, rol
- **Válido por**: 15 minutos (configurable)
- **Uso**: Se envía en cada petición autenticada
- **Header**: `Authorization: Bearer <token>`

### Refresh Token
- **Contiene**: Token aleatorio almacenado en base de datos
- **Válido por**: 7 días (configurable)
- **Uso**: Para obtener un nuevo access token sin re-autenticarse
- **Endpoint**: `POST /auth/refresh`

---

## 📝 Ejemplo Práctico: Usuario josuegarcab2@hotmail.com

### Escenario 1: Primera vez (Usuario nuevo)

1. Usuario visita: `http://localhost:3000/auth/google`
2. Se autentica en Google con `josuegarcab2@hotmail.com`
3. Autoriza la aplicación
4. Google redirige a: `/auth/google/callback?code=ABC123...`
5. Tu backend:
   - Intercambia código por perfil
   - Obtiene: `{email: "josuegarcab2@hotmail.com", name: "Josué García"}`
   - Busca en base de datos: **NO existe**
   - Crea nuevo usuario:
     ```javascript
     {
       id: 4,
       name: "Josué García",
       email: "josuegarcab2@hotmail.com",
       password: "random_hex_string",
       role: "usuario",
       oauthProvider: "google",
       oauthId: "123456789",
       active: true
     }
     ```
6. Genera tokens JWT
7. Redirige a `/auth/oauth/success` con tokens

### Escenario 2: Usuario existente

1. Usuario visita: `http://localhost:3000/auth/google`
2. Se autentica en Google
3. Tu backend:
   - Busca en base de datos: **SÍ existe** (email: `josuegarcab2@hotmail.com`)
   - Actualiza el usuario:
     ```javascript
     {
       oauthProvider: "google",
       oauthId: "123456789"
     }
     ```
4. Genera tokens JWT
5. Redirige con tokens

---

## 🐛 Solución de Problemas

### Error: "Unknown authentication strategy 'google'"

**Causa**: La estrategia no se registró correctamente.

**Solución**:
1. Verifica que las credenciales estén en `.env`
2. Reinicia el servidor completamente
3. Revisa los logs al iniciar - deberías ver:
   ```
   ✅ Registrando estrategia Google OAuth...
   ✅ Estrategia Google OAuth registrada correctamente
   ```

### Error: "redirect_uri_mismatch"

**Causa**: La URL de callback no coincide.

**Solución**:
- En Google Cloud Console, verifica que la URL sea exactamente:
  `http://localhost:3000/auth/google/callback`
- En tu `.env`, verifica:
  `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`

### El usuario no se crea

**Causa**: Error en el repositorio o en la creación.

**Solución**:
- Revisa los logs del servidor
- Verifica que `UserRepository.create()` funcione correctamente
- Asegúrate de que el email del perfil de Google esté disponible

---

## ✅ Checklist de Verificación

- [ ] Credenciales OAuth configuradas en `.env`
- [ ] Servidor inicia sin errores
- [ ] Logs muestran "Estrategia Google OAuth registrada"
- [ ] Usuario puede visitar `/auth/google`
- [ ] Usuario es redirigido a Google
- [ ] Usuario autoriza la aplicación
- [ ] Usuario es redirigido de vuelta
- [ ] Usuario se crea/actualiza en la base de datos
- [ ] Tokens se generan correctamente
- [ ] Usuario recibe tokens en la respuesta

---

## 🎯 Próximos Pasos

1. **Probar el flujo completo** con tu usuario de prueba
2. **Verificar en la base de datos** que el usuario se creó correctamente
3. **Usar el access token** para hacer peticiones autenticadas
4. **Probar refresh token** cuando el access token expire

---

## 📚 Recursos

- [Documentación de Passport.js](http://www.passportjs.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [JWT.io](https://jwt.io/) - Para decodificar y verificar tokens

