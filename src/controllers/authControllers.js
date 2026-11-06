const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

function crearToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

exports.registrarUsuario = async (req, res) => {
    const { identificacion, nombre, telefono, direccion, email, password } = req.body;
    if (![identificacion, nombre, email, password].every((valor) =>
        typeof valor === 'string' && valor.trim())) {
        return res.status(400).json({ exito: false, mensaje: 'Identificación, nombre, correo y contraseña son obligatorios.' });
    }

    try {
        const passwordEncriptada = await bcrypt.hash(password, 10);
        const [resultado] = await db.query(
            `INSERT INTO usuarios (identificacion, nombre, telefono, direccion, email, password)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [identificacion.trim(), nombre.trim(), telefono || null, direccion || null, email.trim().toLowerCase(), passwordEncriptada]
        );
        res.status(201).json({ exito: true, id: resultado.insertId, mensaje: 'Usuario registrado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ exito: false, mensaje: 'El correo o la identificación ya están registrados.' });
        }
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo registrar el usuario.' });
    }
};

exports.iniciarSesion = async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña son obligatorios.' });
    }

    try {
        const [usuarios] = await db.query(
            'SELECT id, identificacion, nombre, email, password, rol FROM usuarios WHERE email = ?',
            [email.trim().toLowerCase()]
        );
        const usuario = usuarios[0];
        if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
            return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas.' });
        }

        const token = crearToken(usuario);
        res.cookie('token_jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
        });
        res.json({
            exito: true,
            token,
            usuario: {
                id: usuario.id,
                identificacion: usuario.identificacion,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo iniciar sesión.' });
    }
};

exports.verPerfil = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, identificacion, nombre, telefono, direccion, email, rol FROM usuarios WHERE id = ?',
            [req.user.id]
        );
        if (!usuarios[0]) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
        }
        res.json({ exito: true, datos: usuarios[0] });
    } catch (error) {
        console.error('Error al consultar el perfil:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo consultar el perfil.' });
    }
};

exports.actualizarPerfil = async (req, res) => {
    const { nombre, telefono, direccion, email } = req.body;
    if (typeof nombre !== 'string' || !nombre.trim() ||
        typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ exito: false, mensaje: 'Nombre y correo son obligatorios.' });
    }

    try {
        const [resultado] = await db.query(
            'UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ?, email = ? WHERE id = ?',
            [nombre.trim(), telefono || null, direccion || null, email.trim().toLowerCase(), req.user.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado.' });
        }
        res.json({ exito: true, mensaje: 'Perfil actualizado. La identificación permanece sin cambios.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ exito: false, mensaje: 'Ese correo ya está registrado.' });
        }
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el perfil.' });
    }
};

exports.historialPrestamos = async (req, res) => {
    try {
        const [prestamos] = await db.query(
            `SELECT p.id, l.titulo, p.fecha_prestamo, p.fecha_tentativadevolucion, p.fecha_devolucion
             FROM prestamos p JOIN libros l ON l.id = p.libro_id
             WHERE p.usuario_id = ? ORDER BY p.id DESC`,
            [req.user.id]
        );
        res.json({ exito: true, datos: prestamos });
    } catch (error) {
        console.error('Error al consultar los préstamos:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo consultar el historial de préstamos.' });
    }
};

exports.historialCompras = async (req, res) => {
    try {
        const [ventas] = await db.query(
            `SELECT v.id, v.fecha, v.total, vd.libro_id, l.titulo, vd.cantidad, vd.precio_unitario
             FROM ventas v
             JOIN venta_detalles vd ON vd.venta_id = v.id
             JOIN libros l ON l.id = vd.libro_id
             WHERE v.usuario_id = ? ORDER BY v.id DESC`,
            [req.user.id]
        );
        res.json({ exito: true, datos: ventas });
    } catch (error) {
        console.error('Error al consultar las compras:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo consultar el historial de compras.' });
    }
};
