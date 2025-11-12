const { authService } = require('../config/dependencies');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida. Por favor proporcione un token válido.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
        message: 'Token inválido o expirado'
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes. Rol requerido: ' + allowedRoles.join(' o ')
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

