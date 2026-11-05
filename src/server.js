import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado con éxito en http://localhost:${PORT}`);
    console.log(`📡 Ambiente: ${config.nodeEnv}`);
  });
};

startServer();
