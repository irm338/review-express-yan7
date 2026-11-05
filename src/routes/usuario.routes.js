import { Router } from 'express';
import {
  obtenerPerfil,
  actualizarPerfil,
  verHistorialPrestamos,
  verHistorialCompras
} from '../controllers/usuario.controller.js';
import { validarPerfilDTO } from '../middlewares/dto.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren estar autenticado (Cliente/Usuario)
router.use(authMiddleware);

// Administrar perfil
router.get('/perfil', obtenerPerfil);
router.put('/perfil', validarPerfilDTO, actualizarPerfil);

// Historial personal
router.get('/historial-prestamos', verHistorialPrestamos);
router.get('/historial-compras', verHistorialCompras);

export default router;
