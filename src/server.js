import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Cargar variables de entorno del archivo .env
dotenv.config();

const PORT = process.env.PORT || 3000;

// Función para inicializar la base de datos y el servidor Express
const iniciarServidor = async () => {
  try {
    // 1. Conectar a MongoDB
    await connectDB();

    // 2. Levantar el servidor en el puerto configurado
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📖 Documentación y rutas base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
  }
};

iniciarServidor();
