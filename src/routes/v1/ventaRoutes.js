const express = require('express');
const ventas = require('../../controllers/ventaController');
const { requerirAutenticacion } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(requerirAutenticacion);
router.get('/', ventas.listarVentas);
router.post('/', ventas.crearVenta);

module.exports = router;
