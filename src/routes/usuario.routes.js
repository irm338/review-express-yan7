import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller.js';
import { validateDTO } from '../middlewares/dto.middleware.js';
import { updatePerfilDTO } from '../dtos/usuario.dto.js';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de usuario requieren autenticación
router.use(authenticateJWT);

// Rutas de administración de perfil del usuario logueado
router.get('/perfil', UsuarioController.obtenerPerfil);
router.put('/perfil', validateDTO(updatePerfilDTO), UsuarioController.actualizarPerfil);

// Historial propio de préstamos
router.get('/prestamos/historial', UsuarioController.verHistorialPrestamos);

// Historial propio de compras (ventas)
router.get('/compras/historial', UsuarioController.verHistorialCompras);

// Listado de usuarios exclusivo para Admin
router.get('/', authorizeRole('admin'), UsuarioController.listarTodos);

export default router;
