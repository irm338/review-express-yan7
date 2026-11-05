import { Router } from 'express';
import { registrar, login, logout } from '../controllers/auth.controller.js';
import { validarRegistroDTO, validarLoginDTO } from '../middlewares/dto.middleware.js';

const router = Router();

// Rutas de autenticación
router.post('/register', validarRegistroDTO, registrar);
router.post('/login', validarLoginDTO, login);
router.post('/logout', logout);

export default router;
