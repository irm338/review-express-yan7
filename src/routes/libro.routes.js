import { Router } from 'express';
import { LibroController } from '../controllers/libro.controller.js';
import { validateDTO } from '../middlewares/dto.middleware.js';
import { createLibroDTO, updateLibroDTO } from '../dtos/libro.dto.js';
import { authenticateJWT, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas Públicas / Consultas
router.get('/', LibroController.listar);
router.get('/buscar', LibroController.buscar);
router.get('/:id', LibroController.obtenerPorId);

// Rutas de Administración (Solo rol Admin)
router.post(
  '/',
  authenticateJWT,
  authorizeRole('admin'),
  validateDTO(createLibroDTO),
  LibroController.crear
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRole('admin'),
  validateDTO(updateLibroDTO),
  LibroController.editar
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRole('admin'),
  LibroController.eliminar
);

export default router;
