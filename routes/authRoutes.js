const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const session = require('express-session');
const config = require('../config');
const authController = require('../controllers/AuthController');
const { validateLogin, validateRegister, validateRefreshToken } = require('../validators/authValidators');
const { authenticate } = require('../middleware/authMiddleware');

// Configurar sesión para OAuth (solo necesario para OAuth)
router.use(session({
  secret: config.session.secret,
  resave: config.session.resave,
  saveUninitialized: config.session.saveUninitialized
}));

// Inicializar Passport
router.use(passport.initialize());
router.use(passport.session());

// Rutas de autenticación local
router.post('/register', validateRegister, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));

// Rutas de Refresh Token
router.post('/refresh', validateRefreshToken, authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

// Rutas de OAuth - Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=oauth_failed' }),
  authController.googleCallback.bind(authController)
);

// Página de éxito OAuth
router.get('/oauth/success', authController.oauthSuccess.bind(authController));

module.exports = router;

