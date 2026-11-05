import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateDTO } from '../middlewares/dto.middleware.js';
import { registerDTO, loginDTO } from '../dtos/auth.dto.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas de autenticación con limitador estricto para evitar fuerza bruta
router.post('/register', authLimiter, validateDTO(registerDTO), AuthController.register);
router.post('/login', authLimiter, validateDTO(loginDTO), AuthController.login);
router.post('/logout', AuthController.logout);

// Perfil del usuario autenticado
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
