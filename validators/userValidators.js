const { body, param, query, validationResult } = require('express-validator');

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

const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido')
    .isEmail().withMessage('Formato de correo electrónico inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['admin', 'usuario']).withMessage('El rol debe ser uno de: admin, usuario'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('active debe ser un valor booleano'),
  
  handleValidationErrors
];

const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Formato de correo electrónico inválido')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('role')
    .optional()
    .isIn(['admin', 'usuario']).withMessage('El rol debe ser uno de: admin, usuario'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('active debe ser un valor booleano'),
  
  handleValidationErrors
];

const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un entero positivo')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100')
    .toInt(),
  
  query('role')
    .optional()
    .isIn(['admin', 'usuario']).withMessage('El rol debe ser uno de: admin, usuario'),
  
  query('name')
    .optional()
    .trim()
    .isLength({ min: 1 }).withMessage('El filtro de nombre no debe estar vacío'),
  
  query('email')
    .optional()
    .trim()
    .isEmail().withMessage('El filtro de correo electrónico debe ser un correo válido'),
  
  query('sort')
    .optional()
    .matches(/^[a-zA-Z]+:(asc|desc)$/).withMessage('El ordenamiento debe estar en formato: campo:asc o campo:desc'),
  
  query('active')
    .optional()
    .isBoolean().withMessage('active debe ser un valor booleano')
    .toBoolean(),
  
  handleValidationErrors
];

const validateGetUserById = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  
  handleValidationErrors
];

const validateDeleteUser = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un entero positivo'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateUser,
  validateUpdateUser,
  validateGetUsers,
  validateGetUserById,
  validateDeleteUser
};

