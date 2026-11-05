import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

/**
 * Limitador general de peticiones para la API
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutos
  max: config.rateLimitMax, // 100 peticiones por ventana
  standardHeaders: true, // Retorna cabeceras RateLimit-* estándar
  legacyHeaders: false, // Deshabilita cabeceras X-RateLimit-* obsoletas
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      statusCode: 429,
      message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.',
      retryAfterMinutes: 15
    });
  }
});

/**
 * Limitador estricto para rutas de autenticación (Login y Registro)
 * Previene ataques de fuerza bruta y DDoS
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      statusCode: 429,
      message: 'Demasiados intentos de acceso o registro desde esta IP. Por seguridad, intente de nuevo en 15 minutos.'
    });
  }
});
