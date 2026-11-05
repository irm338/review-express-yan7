import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

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

// Ruta base de estado / Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor Express de Biblioteca funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default app;
