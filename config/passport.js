const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const crypto = require("crypto");
const config = require("./index");
const { userRepository, authService } = require("./dependencies");

// Serialización de usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de Google OAuth 2.0
const hasGoogleCredentials =
  config.oauth.google.clientID &&
  config.oauth.google.clientSecret &&
  config.oauth.google.clientID.trim() !== "" &&
  config.oauth.google.clientSecret.trim() !== "";

if (hasGoogleCredentials) {
  try {
    console.log("✅ Registrando estrategia Google OAuth...");
    console.log(
      "   Client ID:",
      config.oauth.google.clientID.substring(0, 20) + "..."
    );
    console.log("   Callback URL:", config.oauth.google.callbackURL);
    passport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientID,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: config.oauth.google.callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Verificar que el perfil tenga email
            if (
              !profile.emails ||
              !profile.emails[0] ||
              !profile.emails[0].value
            ) {
              return done(
                new Error("No se pudo obtener el email del perfil de Google"),
                null
              );
            }

            const email = profile.emails[0].value;

            // Buscar usuario por email de Google
            let user = await userRepository.findByEmail(email);

            if (!user) {
              // Crear nuevo usuario si no existe
              user = await userRepository.create({
                name:
                  profile.displayName || profile.name?.givenName || "Usuario",
                email: email,
                password: crypto.randomBytes(32).toString("hex"), // Contraseña aleatoria (no se usará)
                role: "usuario",
                oauthProvider: "google",
                oauthId: profile.id,
              });
            } else {
              // Actualizar información OAuth si el usuario ya existe
              await userRepository.update(user.id, {
                oauthProvider: "google",
                oauthId: profile.id,
              });
              user = await userRepository.findById(user.id);
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
    console.log("✅ Estrategia Google OAuth registrada correctamente");
  } catch (error) {
    console.error(
      "❌ Error al registrar estrategia Google OAuth:",
      error.message
    );
  }
} else {
  console.warn(
    "⚠️  Google OAuth no configurado: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET"
  );
  console.warn("   Client ID presente:", !!config.oauth.google.clientID);
  console.warn(
    "   Client Secret presente:",
    !!config.oauth.google.clientSecret
  );
}

module.exports = passport;
