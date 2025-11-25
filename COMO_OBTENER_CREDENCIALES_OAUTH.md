# 🔑 Cómo Obtener las Credenciales OAuth

Esta guía te explica paso a paso cómo obtener las credenciales OAuth de Google y GitHub.

---

## 📋 Resumen Rápido

**Sí, Google y GitHub te proporcionan estas credenciales**, pero **TÚ debes crearlas** en sus plataformas de desarrollador. Es un proceso gratuito y toma aproximadamente 10-15 minutos por proveedor.

---

## 🔵 Obtener Credenciales de Google OAuth

### Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear o Seleccionar un Proyecto

1. En la parte superior, haz clic en el selector de proyectos
2. Si no tienes proyectos:
   - Haz clic en **"Nuevo Proyecto"**
   - Dale un nombre (ej: "Express Backend AWM")
   - Haz clic en **"Crear"**
3. Si ya tienes proyectos, selecciona uno existente

### Paso 3: Configurar la Pantalla de Consentimiento OAuth

**IMPORTANTE**: La primera vez que creas credenciales OAuth, debes configurar esto primero.

1. Ve a **"APIs & Services"** > **"OAuth consent screen"** (o "Pantalla de consentimiento OAuth")
2. Selecciona el tipo de usuario:
   - **External** (para desarrollo y pruebas) - Recomendado para empezar
   - **Internal** (solo para cuentas de Google Workspace)
3. Completa el formulario:
   - **App name**: Nombre de tu aplicación (ej: "Express Backend AWM")
   - **User support email**: Tu email
   - **Developer contact information**: Tu email
4. Haz clic en **"Save and Continue"**
5. En **Scopes** (Alcances):
   - Haz clic en **"Add or Remove Scopes"**
   - Selecciona:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Haz clic en **"Update"** y luego **"Save and Continue"**
6. En **Test users** (Usuarios de prueba):
   - Si tu app es "External", agrega tu email como usuario de prueba
   - Haz clic en **"Save and Continue"**
7. Revisa y haz clic en **"Back to Dashboard"**

### Paso 4: Crear las Credenciales OAuth

1. Ve a **"APIs & Services"** > **"Credentials"** (Credenciales)
2. Haz clic en **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Si es la primera vez, te pedirá configurar la pantalla de consentimiento (ya lo hiciste en el paso anterior)
4. Selecciona el tipo de aplicación: **"Web application"**
5. Completa el formulario:
   - **Name**: Un nombre para identificar estas credenciales (ej: "Express Backend OAuth")
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/google/callback
     ```
6. Haz clic en **"CREATE"**

### Paso 5: Copiar las Credenciales

Después de crear, verás un popup con:

- **Your Client ID**: Algo como `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Your Client Secret**: Algo como `GOCSPX-abcdefghijklmnopqrstuvwxyz`

⚠️ **IMPORTANTE**: Copia estas credenciales AHORA, porque el Client Secret solo se muestra una vez.

### Paso 6: Agregar al archivo .env

Crea o edita el archivo `.env` en la raíz de tu proyecto:

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 🐙 Obtener Credenciales de GitHub OAuth

### Paso 1: Acceder a GitHub Settings

1. Inicia sesión en [GitHub](https://github.com/)
2. Haz clic en tu foto de perfil (esquina superior derecha)
3. Selecciona **"Settings"** (Configuración)

### Paso 2: Ir a Developer Settings

1. En el menú lateral izquierdo, desplázate hacia abajo
2. Haz clic en **"Developer settings"** (Configuración de desarrollador)

### Paso 3: Crear una OAuth App

1. En el menú lateral, haz clic en **"OAuth Apps"**
2. Haz clic en el botón **"New OAuth App"** (Nueva aplicación OAuth)

### Paso 4: Completar el Formulario

Completa los siguientes campos:

- **Application name**:

  - Un nombre para tu aplicación (ej: "Express Backend AWM")
  - Este nombre aparecerá cuando los usuarios autoricen tu app

- **Homepage URL**:

  ```
  http://localhost:3000
  ```

- **Authorization callback URL**:
  ```
  http://localhost:3000/auth/github/callback
  ```
  ⚠️ **MUY IMPORTANTE**: Esta URL debe coincidir EXACTAMENTE con la que configures en tu código

### Paso 5: Registrar la Aplicación

1. Haz clic en **"Register application"** (Registrar aplicación)

### Paso 6: Obtener las Credenciales

Después de registrar, verás la página de tu OAuth App con:

- **Client ID**: Un número largo (ej: `Iv1.8a61f9b3a7aba766`)
- **Client Secret**: Haz clic en **"Generate a new client secret"** para verlo

⚠️ **IMPORTANTE**:

- El Client Secret se genera cuando haces clic en el botón
- Cópialo INMEDIATAMENTE porque solo se muestra una vez
- Si lo pierdes, tendrás que generar uno nuevo

### Paso 7: Agregar al archivo .env

Agrega estas líneas a tu archivo `.env`:

```env
GITHUB_CLIENT_ID=Iv1.8a61f9b3a7aba766
GITHUB_CLIENT_SECRET=tu_client_secret_generado_aqui
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

---

## 📝 Ejemplo Completo de Archivo .env

Aquí tienes un ejemplo completo de cómo debería verse tu archivo `.env`:

```env
# JWT Configuration
JWT_SECRET=tu_secret_jwt_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS=7

# Server Configuration
PORT=3000

# Session Configuration
SESSION_SECRET=tu_session_secret_super_seguro_aqui_cambiar_en_produccion

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# GitHub OAuth 2.0 Configuration
GITHUB_CLIENT_ID=Iv1.8a61f9b3a7aba766
GITHUB_CLIENT_SECRET=ghp_abcdefghijklmnopqrstuvwxyz1234567890
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

---

## ✅ Verificar que Funciona

Después de configurar las credenciales:

1. Reinicia tu servidor:

   ```bash
   npm start
   ```

2. Ejecuta el script de verificación:

   ```bash
   node test-oauth.js
   ```

3. Deberías ver:

   ```
   ✅ Google OAuth: Configurado
   ✅ GitHub OAuth: Configurado
   ```

4. Prueba en el navegador:
   - Google: `http://localhost:3000/auth/google`
   - GitHub: `http://localhost:3000/auth/github`

---

## ⚠️ Puntos Importantes

### Seguridad

1. **NUNCA** subas tu archivo `.env` a Git
2. Asegúrate de que `.env` esté en tu `.gitignore`
3. Los Client Secrets son información sensible - trátalos como contraseñas

### URLs de Callback

- Las URLs de callback deben coincidir **EXACTAMENTE** entre:
  - Lo que configuras en Google/GitHub
  - Lo que tienes en tu archivo `.env`
  - Lo que tienes en tu código

### Para Producción

Cuando despliegues a producción:

1. **Google**:

   - Agrega tu dominio de producción en "Authorized JavaScript origins"
   - Agrega `https://tudominio.com/auth/google/callback` en "Authorized redirect URIs"

2. **GitHub**:

   - Actualiza "Homepage URL" a tu dominio de producción
   - Actualiza "Authorization callback URL" a `https://tudominio.com/auth/github/callback`

3. **Variables de entorno**:
   - Actualiza las URLs en tu `.env` de producción
   - Usa HTTPS en lugar de HTTP

---

## 🆘 Problemas Comunes

### "redirect_uri_mismatch" en Google

**Causa**: La URL de callback no coincide.

**Solución**:

- Verifica que en Google Cloud Console, en "Authorized redirect URIs", tengas exactamente: `http://localhost:3000/auth/google/callback`
- Verifica que en tu `.env` tengas: `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`

### "redirect_uri_mismatch" en GitHub

**Causa**: La URL de callback no coincide.

**Solución**:

- Ve a tu OAuth App en GitHub
- Verifica que "Authorization callback URL" sea exactamente: `http://localhost:3000/auth/github/callback`
- Verifica que en tu `.env` tengas: `GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback`

### "invalid_client" o "unauthorized_client"

**Causa**: Las credenciales (Client ID o Client Secret) son incorrectas.

**Solución**:

- Verifica que copiaste correctamente el Client ID y Client Secret
- Asegúrate de que no haya espacios extra en el archivo `.env`
- Si perdiste el Client Secret, genera uno nuevo

### No puedo ver el Client Secret en GitHub

**Causa**: El Client Secret solo se muestra una vez cuando lo generas.

**Solución**:

- Haz clic en "Generate a new client secret"
- Copia el nuevo secret inmediatamente
- Actualiza tu archivo `.env`

---

## 📚 Recursos Adicionales

- [Documentación de Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Documentación de GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [Guía de Testing OAuth](./GUIA_TESTING_OAUTH.md)

---

## 🎯 Resumen

1. **Google**: Ve a Google Cloud Console → Crea proyecto → Configura OAuth consent screen → Crea OAuth client ID
2. **GitHub**: Ve a GitHub Settings → Developer settings → OAuth Apps → New OAuth App
3. **Copia las credenciales** a tu archivo `.env`
4. **Reinicia el servidor** y prueba

¡Es un proceso gratuito y toma aproximadamente 10-15 minutos por proveedor!
