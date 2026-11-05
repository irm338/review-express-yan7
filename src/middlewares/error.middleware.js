/**
 * Middleware centralizado para manejo de errores de Express
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Errores de validación de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'fail',
      message: 'JSON malformado en el cuerpo de la petición',
      error: err.message
    });
  }

  // Errores de clave duplicada en MongoDB (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({
      status: 'fail',
      message: `El valor ingresado para ${field} ya existe en el sistema`,
      field
    });
  }

  // Código de estado HTTP por defecto
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};
