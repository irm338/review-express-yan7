const db = require('../config/db');

function validarId(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

exports.listarPrestamos = async (req, res) => {
    try {
        const esAdmin = req.user.rol === 'admin';
        const [prestamos] = await db.query(
            `SELECT p.id, p.usuario_id, u.nombre AS usuario, p.libro_id, l.titulo,
                    p.fecha_prestamo, p.fecha_tentativadevolucion, p.fecha_devolucion
             FROM prestamos p
             JOIN usuarios u ON u.id = p.usuario_id
             JOIN libros l ON l.id = p.libro_id
             ${esAdmin ? '' : 'WHERE p.usuario_id = ?'}
             ORDER BY p.id DESC`,
            esAdmin ? [] : [req.user.id]
        );
        res.json({ exito: true, datos: prestamos });
    } catch (error) {
        console.error('Error al listar préstamos:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudieron consultar los préstamos.' });
    }
};

exports.crearPrestamo = async (req, res) => {
    const { libro_id, fecha_tentativadevolucion } = req.body;
    if (!validarId(libro_id) || typeof fecha_tentativadevolucion !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha_tentativadevolucion)) {
        return res.status(400).json({ exito: false, mensaje: 'Indique un libro y una fecha de devolución válida (AAAA-MM-DD).' });
    }

    let conexion;
    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();
        const [libros] = await conexion.query(
            'SELECT id, stock FROM libros WHERE id = ? FOR UPDATE',
            [libro_id]
        );
        if (!libros[0]) {
            await conexion.rollback();
            return res.status(404).json({ exito: false, mensaje: 'Libro no encontrado.' });
        }
        if (libros[0].stock < 1) {
            await conexion.rollback();
            return res.status(409).json({ exito: false, mensaje: 'No hay ejemplares disponibles.' });
        }

        await conexion.query('UPDATE libros SET stock = stock - 1 WHERE id = ?', [libro_id]);
        const [resultado] = await conexion.query(
            `INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_tentativadevolucion)
             VALUES (?, ?, CURDATE(), ?)`,
            [req.user.id, libro_id, fecha_tentativadevolucion]
        );
        await conexion.commit();
        res.status(201).json({ exito: true, id: resultado.insertId, mensaje: 'Préstamo registrado.' });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error al registrar préstamo:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo registrar el préstamo.' });
    } finally {
        if (conexion) conexion.release();
    }
};

exports.devolverPrestamo = async (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({ exito: false, mensaje: 'El identificador del préstamo no es válido.' });
    }

    let conexion;
    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();
        const [prestamos] = await conexion.query(
            'SELECT id, libro_id, fecha_devolucion FROM prestamos WHERE id = ? FOR UPDATE',
            [req.params.id]
        );
        if (!prestamos[0]) {
            await conexion.rollback();
            return res.status(404).json({ exito: false, mensaje: 'Préstamo no encontrado.' });
        }
        if (prestamos[0].fecha_devolucion) {
            await conexion.rollback();
            return res.status(409).json({ exito: false, mensaje: 'Este préstamo ya fue devuelto.' });
        }

        await conexion.query(
            'UPDATE prestamos SET fecha_devolucion = CURDATE() WHERE id = ?',
            [req.params.id]
        );
        await conexion.query(
            'UPDATE libros SET stock = stock + 1 WHERE id = ?',
            [prestamos[0].libro_id]
        );
        await conexion.commit();
        res.json({ exito: true, mensaje: 'Devolución registrada.' });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error al registrar devolución:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo registrar la devolución.' });
    } finally {
        if (conexion) conexion.release();
    }
};
