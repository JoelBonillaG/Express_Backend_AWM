const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array()
    });
  }
  next();
};

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Formato de correo electrónico inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

module.exports = {
  validateLogin
};

