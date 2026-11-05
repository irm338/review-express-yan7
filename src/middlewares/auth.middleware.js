import passport from '../config/passport.js';

// Módulo 5: Middleware para verificar autenticación JWT
export const authMiddleware = passport.authenticate('jwt', { session: false });

// Módulo 5: Middleware para verificar si el usuario tiene rol Admin
export const esAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado: Se requiere rol de Administrador' });
};
