import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from './config/passport.js';

// Middlewares
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { semverMiddleware } from './middlewares/version.middleware.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import libroRoutes from './routes/libro.routes.js';
import prestamoRoutes from './routes/prestamo.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

const app = express();

// ==========================================
// Módulo 1 & 3: Middlewares Fundamentales
// ==========================================
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ==========================================
// Módulo 4: Versionado SemVer y Rate Limit
// ==========================================
app.use('/api', generalLimiter);
app.use('/api', semverMiddleware);

// ==========================================
// Módulo 5: Enrutamiento MVC
// ==========================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/libros', libroRoutes);
app.use('/api/v1/prestamos', prestamoRoutes);
app.use('/api/v1/ventas', ventaRoutes);
app.use('/api/v1/usuarios', usuarioRoutes);

// Ruta de prueba rápida (Health check)
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'Servidor Express de Biblioteca funcionando' });
});

export default app;
