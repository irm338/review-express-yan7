import { Router } from 'express';
import { prestarLibro, devolverLibro, listarPrestamos } from '../controllers/prestamo.controller.js';
import { validarPrestamoDTO } from '../middlewares/dto.middleware.js';
import { authMiddleware, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Exclusivo para Admin
router.post('/', authMiddleware, esAdmin, validarPrestamoDTO, prestarLibro);
router.put('/:id/devolucion', authMiddleware, esAdmin, devolverLibro);
router.get('/', authMiddleware, esAdmin, listarPrestamos);

export default router;
