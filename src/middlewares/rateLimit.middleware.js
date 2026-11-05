import rateLimit from 'express-rate-limit';

// Módulo 4: Límite de peticiones con express-rate-limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por ventana
  message: { error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en 15 minutos.' }
});
