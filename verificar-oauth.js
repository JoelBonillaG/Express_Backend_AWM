/**
 * Script para verificar la configuración OAuth
 * Ejecutar: node verificar-oauth.js
 */

require("dotenv").config();
const config = require("./config");

console.log("\n🔍 Verificando configuración OAuth...\n");

// Verificar Google OAuth
console.log("📋 Google OAuth:");
console.log(
  "   Client ID:",
  config.oauth.google.clientID
    ? `✅ ${config.oauth.google.clientID.substring(0, 30)}...`
    : "❌ NO configurado"
);
console.log(
  "   Client Secret:",
  config.oauth.google.clientSecret ? "✅ Configurado" : "❌ NO configurado"
);
console.log("   Callback URL:", config.oauth.google.callbackURL);

// Verificar que las credenciales no estén vacías
const googleOK =
  config.oauth.google.clientID &&
  config.oauth.google.clientSecret &&
  config.oauth.google.clientID.trim() !== "" &&
  config.oauth.google.clientSecret.trim() !== "";

console.log("   Estado:", googleOK ? "✅ LISTO" : "❌ FALTAN CREDENCIALES\n");

// Verificar que passport.js se puede cargar
console.log("🔧 Verificando Passport.js...");
try {
  const passport = require("./config/passport");
  console.log("   ✅ Passport.js se carga correctamente");

  // Verificar que las estrategias estén registradas
  const strategies = Object.keys(passport._strategies || {});
  console.log(
    "   Estrategias registradas:",
    strategies.length > 0 ? strategies.join(", ") : "NINGUNA"
  );

  if (strategies.includes("google")) {
    console.log('   ✅ Estrategia "google" está registrada');
  } else {
    console.log('   ❌ Estrategia "google" NO está registrada');
    if (!googleOK) {
      console.log("   💡 Razón: Faltan credenciales de Google");
    }
  }
} catch (error) {
  console.error("   ❌ Error al cargar Passport.js:", error.message);
}

console.log("\n📝 Instrucciones:");
console.log("   1. Asegúrate de que tu archivo .env tenga:");
console.log("      GOOGLE_CLIENT_ID=tu_client_id");
console.log("      GOOGLE_CLIENT_SECRET=tu_client_secret");
console.log(
  "      GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback"
);
console.log("\n   2. Reinicia el servidor después de configurar .env");
console.log("   3. Visita: http://localhost:3000/auth/google\n");
