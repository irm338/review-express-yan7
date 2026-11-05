import rateLimit from 'express-rate-limit';

// Módulo 4: Límite de peticiones con express-rate-limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 100, // Máximo 100 peticiones por IP en esos 15 minutos
  message: {
    error: 'Has superado el límite de peticiones. Por favor espera 15 minutos.'
  }
});
