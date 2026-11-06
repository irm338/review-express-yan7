const db = require('../config/db');
const LibroDTO = require('../dtos/libretoDto');

function validarId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

exports.listarLibros = async (req, res) => {
    try {
        const [libros] = await db.query(
            'SELECT id, titulo, autor, categoria, precio, stock FROM libros ORDER BY titulo'
        );
        res.json({ exito: true, datos: libros });
    } catch (error) {
        console.error('Error al listar libros:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudieron consultar los libros.' });
    }
};

exports.crearLibro = async (req, res) => {
    const libro = new LibroDTO(req.body);
    const errorValidacion = libro.validar();
    if (errorValidacion) {
        return res.status(400).json({ exito: false, mensaje: errorValidacion });
    }

    try {
        const [resultado] = await db.query(
            'INSERT INTO libros (titulo, autor, categoria, precio, stock) VALUES (?, ?, ?, ?, ?)',
            [libro.titulo, libro.autor, libro.categoria, libro.precio, libro.stock]
        );
        res.status(201).json({ exito: true, id: resultado.insertId, mensaje: 'Libro creado correctamente.' });
    } catch (error) {
        console.error('Error al crear libro:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo crear el libro.' });
    }
};

exports.editarLibro = async (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({ exito: false, mensaje: 'El identificador del libro no es válido.' });
    }
    const libro = new LibroDTO(req.body);
    const errorValidacion = libro.validar();
    if (errorValidacion) {
        return res.status(400).json({ exito: false, mensaje: errorValidacion });
    }

    try {
        const [resultado] = await db.query(
            `UPDATE libros SET titulo = ?, autor = ?, categoria = ?, precio = ?, stock = ?
             WHERE id = ?`,
            [libro.titulo, libro.autor, libro.categoria, libro.precio, libro.stock, req.params.id]
        );
        if (!resultado.affectedRows) {
            return res.status(404).json({ exito: false, mensaje: 'Libro no encontrado.' });
        }
        res.json({ exito: true, mensaje: 'Libro actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar libro:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo actualizar el libro.' });
    }
};

exports.eliminarLibro = async (req, res) => {
    if (!validarId(req.params.id)) {
        return res.status(400).json({ exito: false, mensaje: 'El identificador del libro no es válido.' });
    }

    try {
        const [resultado] = await db.query('DELETE FROM libros WHERE id = ?', [req.params.id]);
        if (!resultado.affectedRows) {
            return res.status(404).json({ exito: false, mensaje: 'Libro no encontrado.' });
        }
        res.json({ exito: true, mensaje: 'Libro eliminado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ exito: false, mensaje: 'No se puede eliminar un libro con préstamos o ventas registrados.' });
        }
        console.error('Error al eliminar libro:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo eliminar el libro.' });
    }
};
