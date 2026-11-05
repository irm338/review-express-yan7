import { Router } from 'express';
import { PrestamoController } from '../controllers/prestamo.controller.js';
import { validateDTO } from '../middlewares/dto.middleware.js';
import { createPrestamoDTO, devolucionDTO } from '../dtos/prestamo.dto.js';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de préstamos requieren autenticación
router.use(authenticateJWT);

// Rutas exclusivas de Admin
router.post(
  '/',
  authorizeRole('admin'),
  validateDTO(createPrestamoDTO),
  PrestamoController.crearPrestamo
);

router.put(
  '/:id/devolucion',
  authorizeRole('admin'),
  validateDTO(devolucionDTO),
  PrestamoController.registrarDevolucion
);

router.get(
  '/',
  authorizeRole('admin'),
  PrestamoController.listarTodos
);

router.get(
  '/usuario/:identificacion',
  authorizeRole('admin'),
  PrestamoController.listarPorUsuario
);

// Detalle de préstamo (Admin o dueño del préstamo)
router.get('/:id', PrestamoController.obtenerPorId);

export default router;
