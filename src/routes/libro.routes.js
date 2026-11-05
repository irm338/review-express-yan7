import { Router } from 'express';
import { crearLibro, listarLibros, buscarLibros, editarLibro, eliminarLibro } from '../controllers/libro.controller.js';
import { validarLibroDTO } from '../middlewares/dto.middleware.js';
import { authMiddleware, esAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Consultas públicas
router.get('/', listarLibros);
router.get('/buscar', buscarLibros);

// Gestión exclusiva para Admin
router.post('/', authMiddleware, esAdmin, validarLibroDTO, crearLibro);
router.put('/:id', authMiddleware, esAdmin, editarLibro);
router.delete('/:id', authMiddleware, esAdmin, eliminarLibro);

export default router;
