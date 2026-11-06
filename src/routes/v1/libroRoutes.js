const express = require('express');
const libros = require('../../controllers/libroController');
const { requerirAutenticacion, requerirAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', libros.listarLibros);
router.post('/', requerirAutenticacion, requerirAdmin, libros.crearLibro);
router.put('/:id', requerirAutenticacion, requerirAdmin, libros.editarLibro);
router.delete('/:id', requerirAutenticacion, requerirAdmin, libros.eliminarLibro);

module.exports = router;
