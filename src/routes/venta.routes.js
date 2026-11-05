import { Router } from 'express';
import { VentaController } from '../controllers/venta.controller.js';
import { validateDTO } from '../middlewares/dto.middleware.js';
import { createVentaDTO } from '../dtos/venta.dto.js';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de ventas requieren autenticación
router.use(authenticateJWT);

// Rutas de administración (Solo Admin)
router.post(
  '/',
  authorizeRole('admin'),
  validateDTO(createVentaDTO),
  VentaController.registrarVenta
);

router.get(
  '/',
  authorizeRole('admin'),
  VentaController.listarTodas
);

router.get(
  '/cliente/:identificacion',
  authorizeRole('admin'),
  VentaController.listarPorCliente
);

// Detalle de una venta (Admin o cliente dueño)
router.get('/:id', VentaController.obtenerPorId);

export default router;
