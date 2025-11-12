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
}

module.exports = new AuthController(authService);

