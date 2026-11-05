import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { config } from './config/env.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { semverMiddleware, CURRENT_API_VERSION } from './middlewares/version.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import libroRoutes from './routes/libro.routes.js';

const app = express();

// Middlewares globales fundamentales de Express (Módulos 1 y 3)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.use(morgan('dev'));

// Inicializar PassportJS (Módulo 5)
app.use(passport.initialize());

// Limitador de peticiones general (Módulo 4)
app.use('/api', generalLimiter);

// Versionado Semántico Semver (Módulo 4)
app.use('/api', semverMiddleware(CURRENT_API_VERSION));

// Rutas de autenticación
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Rutas de libros e inventario (Admin CRUD y público búsqueda/listado)
app.use('/api/v1/libros', libroRoutes);
app.use('/api/libros', libroRoutes);

// Ruta base de estado / Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor Express de Biblioteca funcionando correctamente',
    apiVersion: req.apiVersion || CURRENT_API_VERSION,
    timestamp: new Date().toISOString()
  });
});

export default app;
