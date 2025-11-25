require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || '123456',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresInDays: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS) || 7
  },
  port: process.env.PORT || 3000,
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 3000}/auth/google/callback`
    },
    github: {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || `http://localhost:${process.env.PORT || 3000}/auth/github/callback`
    }
  },
  session: {
    secret: process.env.SESSION_SECRET || 'session-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false
  }
};

