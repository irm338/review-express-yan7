import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const PORT = config.port;

const startServer = async () => {
  try {
    // Intentar conectar a MongoDB al iniciar
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('⚠️ El servidor continuará ejecutándose. Configure MongoDB para funcionalidades de base de datos.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor Express iniciado con éxito en http://localhost:${PORT}`);
      console.log(`📡 Ambiente: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
