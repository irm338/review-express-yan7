const express = require('express');
const prestamos = require('../../controllers/prestamoController');
const { requerirAutenticacion, requerirAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(requerirAutenticacion);
router.get('/', prestamos.listarPrestamos);
router.post('/', prestamos.crearPrestamo);
router.patch('/:id/devolver', requerirAdmin, prestamos.devolverPrestamo);

module.exports = router;
