import passport from '../config/passport.js';

// Módulo 5: Middleware para verificar si el usuario inició sesión
export const authMiddleware = passport.authenticate('jwt', { session: false });

// Módulo 5: Middleware para verificar si el usuario tiene rol de Administrador
export const esAdmin = (req, res, next) => {
  // req.user viene del token verificado por Passport
  if (req.user && req.user.rol === 'admin') {
    return next(); // Continúa hacia el controlador
  }
  return res.status(403).json({
    error: 'Acceso denegado: Esta acción solo está permitida para Administradores'
  });
};
