import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './config/passport.js';

// Middlewares
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { semverMiddleware } from './middlewares/version.middleware.js';

// Rutas de la aplicación
import authRoutes from './routes/auth.routes.js';
import libroRoutes from './routes/libro.routes.js';
import prestamoRoutes from './routes/prestamo.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

const app = express();

// ============================================================================
// 1. Middlewares Fundamentales de Express (Módulos 1 y 3)
// ============================================================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // Permite recibir cuerpos JSON (req.body)
app.use(cookieParser()); // Módulo 3: Permite leer y escribir cookies en el cliente
app.use(passport.initialize()); // Módulo 5: Inicializa Passport para autenticación JWT

// ============================================================================
// 2. Middlewares de Versionado SemVer y Límite de Peticiones (Módulo 4)
// ============================================================================
app.use('/api', generalLimiter); // Límite de 100 peticiones cada 15 min
app.use('/api', semverMiddleware); // Valida y agrega versión semántica (1.0.0)

// ============================================================================
// 3. Montaje de Rutas Versionadas /api/v1 (Patrón MVC - Módulo 5)
// ============================================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/libros', libroRoutes);
app.use('/api/v1/prestamos', prestamoRoutes);
app.use('/api/v1/ventas', ventaRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);

// Ruta rápida de prueba de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor Express de Biblioteca funcionando correctamente' });
});

export default app;
