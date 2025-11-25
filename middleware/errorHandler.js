const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);

  // Si la respuesta ya fue enviada, delegar al handler por defecto
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  if (err.message) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message,
      path: req.path
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    path: req.path
  });
};

module.exports = errorHandler;

