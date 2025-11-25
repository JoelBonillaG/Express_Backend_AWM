# Guía de Testing OAuth 2.0

Esta guía te ayudará a configurar y probar la implementación de OAuth 2.0 con Google y GitHub.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Configurar Google OAuth](#configurar-google-oauth)
3. [Configurar GitHub OAuth](#configurar-github-oauth)
4. [Probar OAuth](#probar-oauth)
5. [Testing con Postman/Thunder Client](#testing-con-postmanthunder-client)
6. [Testing Manual en Navegador](#testing-manual-en-navegador)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y completa las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales OAuth.

---

## 🔵 Configurar Google OAuth

### Paso 1: Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ (si es necesario)

### Paso 2: Crear credenciales OAuth 2.0

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **OAuth client ID**
3. Si es la primera vez, configura la pantalla de consentimiento OAuth
4. Selecciona **Web application** como tipo de aplicación
5. Configura:
   - **Name**: Nombre de tu aplicación (ej: "Express Backend AWM")
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback`
6. Copia el **Client ID** y **Client Secret**

### Paso 3: Agregar al archivo .env

```env
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 🐙 Configurar GitHub OAuth

### Paso 1: Crear OAuth App en GitHub

1. Ve a tu perfil de GitHub > **Settings** > **Developer settings**
2. Haz clic en **OAuth Apps** > **New OAuth App**
3. Completa el formulario:
   - **Application name**: Nombre de tu aplicación
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Haz clic en **Register application**
5. Copia el **Client ID** y genera un **Client Secret**

### Paso 2: Agregar al archivo .env

```env
GITHUB_CLIENT_ID=tu_github_client_id_aqui
GITHUB_CLIENT_SECRET=tu_github_client_secret_aqui
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

---

## 🧪 Probar OAuth

### Opción 1: Testing Manual en Navegador (Recomendado)

#### Probar Google OAuth:

1. Inicia el servidor:

```bash
npm start
```

2. Abre tu navegador y ve a:

```
http://localhost:3000/auth/google
```

3. Serás redirigido a Google para autenticarte
4. Después de autenticarte, serás redirigido a:

```
http://localhost:3000/auth/oauth/success?accessToken=...&refreshToken=...
```

5. Verás una respuesta JSON con los tokens:

```json
{
  "success": true,
  "message": "Autenticación OAuth exitosa",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_aqui"
  },
  "note": "En producción, estos tokens deberían enviarse en cookies httpOnly"
}
```

#### Probar GitHub OAuth:

1. Ve a:

```
http://localhost:3000/auth/github
```

2. Serás redirigido a GitHub para autorizar la aplicación
3. Después de autorizar, serás redirigido con los tokens

---

### Opción 2: Testing con cURL

#### Probar Google OAuth (solo inicio del flujo):

```bash
# Iniciar el flujo OAuth (esto redirige a Google)
curl -L http://localhost:3000/auth/google
```

**Nota**: cURL no puede completar el flujo completo porque requiere interacción del navegador.

---

### Opción 3: Testing con Postman/Thunder Client

#### Paso 1: Obtener tokens manualmente

1. Abre tu navegador y ve a `http://localhost:3000/auth/google`
2. Completa el flujo OAuth
3. Copia el `accessToken` de la respuesta

#### Paso 2: Usar el token en Postman

1. Crea una nueva petición GET a `http://localhost:3000/users`
2. En la pestaña **Authorization**, selecciona **Bearer Token**
3. Pega el `accessToken` obtenido
4. Envía la petición

**Ejemplo de petición con token:**

```
GET http://localhost:3000/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔍 Verificar que OAuth funciona

### 1. Verificar que el usuario se creó/actualizó

Después de autenticarte con OAuth, verifica que el usuario existe en la base de datos:

```bash
# Obtener todos los usuarios (requiere autenticación)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

Deberías ver el usuario creado con `oauthProvider: "google"` o `oauthProvider: "github"`.

### 2. Probar refresh token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN"
  }'
```

### 3. Probar logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN"
  }'
```

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Problema**: La URL de callback no coincide con la configurada en Google/GitHub.

**Solución**:

- Verifica que `GOOGLE_CALLBACK_URL` o `GITHUB_CALLBACK_URL` en `.env` coincida exactamente con la configurada en el proveedor OAuth
- Asegúrate de incluir el protocolo completo: `http://localhost:3000/auth/google/callback`

### Error: "invalid_client"

**Problema**: Las credenciales OAuth son incorrectas.

**Solución**:

- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén correctos
- Verifica que `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET` estén correctos
- Asegúrate de que no haya espacios extra en el archivo `.env`

### Error: "No se pudo obtener el email del perfil"

**Problema**: El perfil de OAuth no incluye email.

**Solución**:

- Para Google: Asegúrate de solicitar el scope `email` (ya está configurado)
- Para GitHub: Verifica que tu cuenta de GitHub tenga un email público o configurado

### El servidor no inicia

**Problema**: Error al iniciar el servidor.

**Solución**:

- Verifica que todas las dependencias estén instaladas: `npm install`
- Verifica que el puerto 3000 no esté en uso
- Revisa los logs del servidor para ver el error específico

### Los tokens no se generan

**Problema**: Después de OAuth exitoso, no se reciben tokens.

**Solución**:

- Verifica que `RefreshTokenRepository` esté correctamente configurado
- Revisa los logs del servidor para ver errores
- Verifica que `authService.generateAccessToken` y `authService.generateRefreshToken` existan

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en `.env`
- [ ] Google OAuth App creado y configurado
- [ ] GitHub OAuth App creado y configurado
- [ ] Servidor inicia sin errores
- [ ] Flujo de Google OAuth funciona
- [ ] Flujo de GitHub OAuth funciona
- [ ] Usuario se crea/actualiza correctamente después de OAuth
- [ ] Tokens se generan correctamente
- [ ] Refresh token funciona
- [ ] Logout funciona

---

## 📝 Notas Importantes

1. **En producción**: Los tokens deberían enviarse en cookies `httpOnly` en lugar de query parameters
2. **Seguridad**: Nunca compartas tus `CLIENT_SECRET` públicamente
3. **Callbacks**: En producción, usa URLs HTTPS
4. **Scopes**: Los scopes actuales son:
   - Google: `['profile', 'email']`
   - GitHub: `['user:email']`

---

## 🎯 Próximos Pasos

- [ ] Implementar cookies httpOnly para producción
- [ ] Agregar más proveedores OAuth (Facebook, Twitter, etc.)
- [ ] Implementar rate limiting para endpoints OAuth
- [ ] Agregar logging de intentos de autenticación OAuth
- [ ] Implementar pruebas automatizadas (unit tests, integration tests)
