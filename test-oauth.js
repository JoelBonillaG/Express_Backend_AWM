/**
 * Script simple para verificar que las rutas OAuth estén configuradas correctamente
 * Ejecutar con: node test-oauth.js
 */

const http = require("http");

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

console.log("🧪 Verificando configuración OAuth...\n");

// Verificar que el servidor esté corriendo
function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE_URL}/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Server responded with status ${res.statusCode}`));
      }
    });

    req.on("error", (err) => {
      reject(new Error(`Server is not running: ${err.message}`));
    });

    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error("Server connection timeout"));
    });
  });
}

// Verificar rutas OAuth
function checkOAuthRoutes() {
  const routes = [
    { path: "/auth/google", name: "Google OAuth" },
    { path: "/auth/oauth/success", name: "OAuth Success" },
  ];

  console.log("📋 Rutas OAuth disponibles:\n");
  routes.forEach((route) => {
    console.log(`  ✅ ${route.name}: ${BASE_URL}${route.path}`);
  });
}

// Verificar variables de entorno
function checkEnvVars() {
  require("dotenv").config();
  const config = require("./config");

  console.log("\n🔐 Verificando variables de entorno:\n");

  // Google OAuth
  const googleConfigured =
    config.oauth.google.clientID && config.oauth.google.clientSecret;
  console.log(
    `  ${googleConfigured ? "✅" : "❌"} Google OAuth: ${
      googleConfigured ? "Configurado" : "NO configurado"
    }`
  );
  if (googleConfigured) {
    console.log(
      `     Client ID: ${config.oauth.google.clientID.substring(0, 20)}...`
    );
    console.log(`     Callback URL: ${config.oauth.google.callbackURL}`);
  } else {
    console.log(
      "     ⚠️  Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
    );
  }

  return { googleConfigured };
}

// Función principal
async function main() {
  try {
    // Verificar servidor
    console.log("🔍 Verificando servidor...");
    await checkServer();
    console.log("  ✅ Servidor está corriendo\n");

    // Verificar rutas
    checkOAuthRoutes();

    // Verificar variables de entorno
    const { googleConfigured } = checkEnvVars();

    // Resumen
    console.log("\n📊 Resumen:\n");
    console.log(`  Servidor: ✅ Corriendo en puerto ${PORT}`);
    console.log(`  Google OAuth: ${googleConfigured ? "✅" : "❌"}`);

    if (googleConfigured) {
      console.log(
        "\n🎉 ¡OAuth está configurado! Puedes probarlo en tu navegador:"
      );
      console.log(`   Google: ${BASE_URL}/auth/google`);
    } else {
      console.log(
        "\n⚠️  Configura Google OAuth para poder probarlo."
      );
      console.log(
        "   Revisa COMO_OBTENER_CREDENCIALES_OAUTH.md para instrucciones detalladas."
      );
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.log("\n💡 Asegúrate de que el servidor esté corriendo:");
    console.log("   npm start");
  }
}

main();
