const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  if (err.message) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
      message: 'Error interno del servidor'
  });
};

module.exports = errorHandler;

