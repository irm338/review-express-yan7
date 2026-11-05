import passport from '../config/passport.js';

/**
 * Middleware para autenticar usuarios con JWT usando Passport.js
 */
export const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        statusCode: 401,
        message: 'Acceso no autorizado. Debe iniciar sesión o enviar un token Bearer / Cookie válida.',
        detail: info?.message || 'Token ausente o expirado'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware para autorización basada en roles (RBAC)
 * @param  {...string} allowedRoles - Roles permitidos ('admin', 'usuario')
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        status: 'fail',
        statusCode: 403,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]. Su rol actual es: '${req.user.rol}'`
      });
    }

    next();
  };
};
