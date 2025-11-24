const { authService, userRepository } = require('../config/dependencies');

/**
 * Middleware para autenticar usuarios mediante JWT
 * Verifica que el token sea válido y no esté expirado
 */
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
    
    // Verificar que el usuario aún existe y está activo
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'La cuenta de usuario está inactiva'
      });
    }

    // Añadir información completa del usuario al request
    req.user = {
      ...decoded,
      user: user.toJSON()
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para autorizar acceso basado en roles
 * @param {...string} allowedRoles - Roles permitidos para acceder al endpoint
 */
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
        message: `Permisos insuficientes. Rol requerido: ${allowedRoles.join(' o ')}. Tu rol actual: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * Permite crear una función personalizada para verificar permisos
 * @param {Function} permissionChecker - Función que recibe (user, req) y retorna boolean
 */
const checkPermission = (permissionChecker) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Autenticación requerida'
        });
      }

      const hasPermission = await permissionChecker(req.user, req);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permisos insuficientes para realizar esta acción'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

/**
 * Middleware para verificar que el usuario es el propietario del recurso
 * Útil para endpoints donde el usuario solo puede acceder a sus propios recursos
 */
const isOwner = (userIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const resourceUserId = parseInt(req.params[userIdParam]);
    const currentUserId = req.user.id;

    // Los administradores pueden acceder a cualquier recurso
    if (req.user.role === 'admin') {
      return next();
    }

    if (resourceUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  };
};

/**
 * Middleware combinado: autenticación + autorización
 * Útil para simplificar rutas que requieren ambos
 */
const requireAuth = (allowedRoles = null) => {
  const middlewares = [authenticate];
  
  if (allowedRoles && allowedRoles.length > 0) {
    middlewares.push(authorize(...allowedRoles));
  }
  
  return middlewares;
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  isOwner,
  requireAuth
};

