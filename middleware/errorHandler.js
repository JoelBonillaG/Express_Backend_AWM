const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Custom application errors
  if (err.message) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
      message: 'Error interno del servidor'
  });
};

module.exports = errorHandler;

