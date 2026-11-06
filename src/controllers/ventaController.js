const db = require('../config/db');

exports.crearVenta = async (req, res) => {
    const { libros } = req.body;
    if (!Array.isArray(libros) || libros.length === 0) {
        return res.status(400).json({ exito: false, mensaje: 'La venta debe incluir al menos un libro.' });
    }

    const cantidades = new Map();
    for (const item of libros) {
        if (!item || !Number.isInteger(Number(item.libro_id)) ||
            Number(item.libro_id) < 1 || !Number.isInteger(Number(item.cantidad)) ||
            Number(item.cantidad) < 1) {
            return res.status(400).json({ exito: false, mensaje: 'Cada libro debe tener un identificador y una cantidad válida.' });
        }
        const libroId = Number(item.libro_id);
        cantidades.set(libroId, (cantidades.get(libroId) || 0) + Number(item.cantidad));
    }

    let conexion;
    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const detalles = [];
        let totalCentavos = 0;
        for (const [libroId, cantidad] of cantidades) {
            const [librosDisponibles] = await conexion.query(
                'SELECT id, titulo, precio, stock FROM libros WHERE id = ? FOR UPDATE',
                [libroId]
            );
            const libro = librosDisponibles[0];
            if (!libro) {
                await conexion.rollback();
                return res.status(404).json({ exito: false, mensaje: `No se encontró el libro ${libroId}.` });
            }
            if (libro.stock < cantidad) {
                await conexion.rollback();
                return res.status(409).json({ exito: false, mensaje: `No hay suficientes ejemplares de "${libro.titulo}".` });
            }

            const precioCentavos = Math.round(Number(libro.precio) * 100);
            totalCentavos += precioCentavos * cantidad;
            detalles.push({ libroId, cantidad, precioCentavos });
        }

        const total = (totalCentavos / 100).toFixed(2);
        const [venta] = await conexion.query(
            'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)',
            [req.user.id, total]
        );
        for (const detalle of detalles) {
            await conexion.query(
                `INSERT INTO venta_detalles (venta_id, libro_id, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)`,
                [venta.insertId, detalle.libroId, detalle.cantidad, (detalle.precioCentavos / 100).toFixed(2)]
            );
            await conexion.query(
                'UPDATE libros SET stock = stock - ? WHERE id = ?',
                [detalle.cantidad, detalle.libroId]
            );
        }

        await conexion.commit();
        res.status(201).json({
            exito: true,
            id: venta.insertId,
            total,
            mensaje: 'Venta registrada correctamente.'
        });
    } catch (error) {
        if (conexion) await conexion.rollback();
        console.error('Error al registrar venta:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo registrar la venta.' });
    } finally {
        if (conexion) conexion.release();
    }
};

exports.listarVentas = async (req, res) => {
    try {
        const esAdmin = req.user.rol === 'admin';
        const [ventas] = await db.query(
            `SELECT v.id, v.usuario_id, u.nombre AS cliente, v.fecha, v.total,
                    vd.libro_id, l.titulo, vd.cantidad, vd.precio_unitario
             FROM ventas v
             JOIN usuarios u ON u.id = v.usuario_id
             JOIN venta_detalles vd ON vd.venta_id = v.id
             JOIN libros l ON l.id = vd.libro_id
             ${esAdmin ? '' : 'WHERE v.usuario_id = ?'}
             ORDER BY v.id DESC`,
            esAdmin ? [] : [req.user.id]
        );
        res.json({ exito: true, datos: ventas });
    } catch (error) {
        console.error('Error al listar ventas:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudieron consultar las ventas.' });
    }
};
