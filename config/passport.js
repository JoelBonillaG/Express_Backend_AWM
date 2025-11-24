const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const crypto = require('crypto');
const config = require('./index');
const { userRepository, authService } = require('./dependencies');

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
if (config.oauth.google.clientID && config.oauth.google.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: config.oauth.google.clientID,
    clientSecret: config.oauth.google.clientSecret,
    callbackURL: config.oauth.google.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por email de Google
      let user = await userRepository.findByEmail(profile.emails[0].value);
      
      if (!user) {
        // Crear nuevo usuario si no existe
        user = await userRepository.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: crypto.randomBytes(32).toString('hex'), // Contraseña aleatoria (no se usará)
          role: 'usuario',
          oauthProvider: 'google',
          oauthId: profile.id
        });
      } else {
        // Actualizar información OAuth si el usuario ya existe
        await userRepository.update(user.id, {
          oauthProvider: 'google',
          oauthId: profile.id
        });
        user = await userRepository.findById(user.id);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Estrategia de GitHub OAuth 2.0
if (config.oauth.github.clientID && config.oauth.github.clientSecret) {
  passport.use(new GitHubStrategy({
    clientID: config.oauth.github.clientID,
    clientSecret: config.oauth.github.clientSecret,
    callbackURL: config.oauth.github.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por email de GitHub
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
      let user = await userRepository.findByEmail(email);
      
      if (!user) {
        // Crear nuevo usuario si no existe
        user = await userRepository.create({
          name: profile.displayName || profile.username,
          email: email,
          password: crypto.randomBytes(32).toString('hex'), // Contraseña aleatoria (no se usará)
          role: 'usuario',
          oauthProvider: 'github',
          oauthId: profile.id.toString()
        });
      } else {
        // Actualizar información OAuth si el usuario ya existe
        await userRepository.update(user.id, {
          oauthProvider: 'github',
          oauthId: profile.id.toString()
        });
        user = await userRepository.findById(user.id);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

module.exports = passport;

