import { Router } from 'express';
import { registrarVenta, listarVentas } from '../controllers/venta.controller.js';
import { validarVentaDTO } from '../middlewares/dto.middleware.js';
import { authMiddleware, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Exclusivo para Admin
router.post('/', authMiddleware, esAdmin, validarVentaDTO, registrarVenta);
router.get('/', authMiddleware, esAdmin, listarVentas);

export default router;
