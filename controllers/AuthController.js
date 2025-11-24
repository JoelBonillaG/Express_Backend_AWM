const { authService } = require('../config/dependencies');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await this.authService.register({ name, email, password, role });
      
      res.status(201).json({
        success: true,
        message: 'Registro exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido'
        });
      }

      const result = await this.authService.refreshAccessToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      
      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      const userId = req.user.id;
      await this.authService.logoutAll(userId);
      
      res.json({
        success: true,
        message: 'Todas las sesiones han sido cerradas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Callback para OAuth - Google
  async googleCallback(req, res, next) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect('/auth/login?error=oauth_failed');
      }

      // Generar tokens para el usuario OAuth
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user.id);

      // Redirigir con tokens en query params (en producción usar cookies httpOnly)
      const redirectUrl = `/auth/oauth/success?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken.token)}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  // Callback para OAuth - GitHub
  async githubCallback(req, res, next) {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect('/auth/login?error=oauth_failed');
      }

      // Generar tokens para el usuario OAuth
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user.id);

      // Redirigir con tokens en query params (en producción usar cookies httpOnly)
      const redirectUrl = `/auth/oauth/success?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken.token)}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  // Página de éxito OAuth (para desarrollo)
  oauthSuccess(req, res) {
    const { accessToken, refreshToken } = req.query;
    
    res.json({
      success: true,
      message: 'Autenticación OAuth exitosa',
      data: {
        accessToken,
        refreshToken
      },
      note: 'En producción, estos tokens deberían enviarse en cookies httpOnly'
    });
  }
}

module.exports = new AuthController(authService);

