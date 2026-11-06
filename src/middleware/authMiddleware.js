
const jwt = require('jsonwebtoken');

exports.requerirAutenticacion = (req, res, next) => {
    const encabezado = req.headers.authorization;
    const token = req.cookies.token_jwt ||
        (encabezado && encabezado.startsWith('Bearer ') ? encabezado.slice(7) : null);

    if (!token) {
        return res.status(401).json({ exito: false, mensaje: 'Debe iniciar sesión.' });
    }
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ exito: false, mensaje: 'La sesión no es válida o ha expirado.' });
    }
};

exports.requerirAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ exito: false, mensaje: 'Esta acción requiere permisos de administrador.' });
    }
    next();
};