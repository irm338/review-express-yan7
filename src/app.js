import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Middlewares globales fundamentales de Express (Módulo 1)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
