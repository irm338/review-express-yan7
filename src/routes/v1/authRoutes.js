const express = require('express');
const auth = require('../../controllers/authControllers');
const { requerirAutenticacion } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/registro', auth.registrarUsuario);
router.post('/login', auth.iniciarSesion);
router.get('/perfil', requerirAutenticacion, auth.verPerfil);
router.put('/perfil', requerirAutenticacion, auth.actualizarPerfil);
router.get('/perfil/prestamos', requerirAutenticacion, auth.historialPrestamos);
router.get('/perfil/compras', requerirAutenticacion, auth.historialCompras);

module.exports = router;
