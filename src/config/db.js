import { MongoClient } from 'mongodb';
import { config } from './env.js';

let client = null;
let db = null;

/**
 * Conexión Singleton a MongoDB utilizando el driver nativo
 */
export const connectDB = async () => {
  if (db) return db;

  try {
    console.log(`⏳ Conectando a MongoDB en: ${config.mongoUri}...`);
    client = new MongoClient(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });

    await client.connect();
    db = client.db(config.dbName);
    console.log(`✅ Conexión exitosa a la base de datos MongoDB: [${config.dbName}]`);

    // Inicializar índices para integridad de datos
    await createIndexes(db);

    return db;
  } catch (error) {
    console.error(`❌ Error crítico al conectar a MongoDB: ${error.message}`);
    console.warn(`⚠️ Verifique que MongoDB esté ejecutándose localmente o configure MONGO_URI en .env`);
    throw error;
  }
};

/**
 * Función para obtener la instancia activa de la base de datos
 */
export const getDB = () => {
  if (!db) {
    throw new Error('La base de datos aún no ha sido inicializada. Llame a connectDB primero.');
  }
  return db;
};

/**
 * Helper para obtener una colección tipada
 */
export const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

/**
 * Crear índices únicos y de búsqueda para las colecciones
 */
const createIndexes = async (database) => {
  try {
    // Índices de Usuarios
    await database.collection('usuarios').createIndex({ identificacion: 1 }, { unique: true });
    await database.collection('usuarios').createIndex({ email: 1 }, { unique: true });

    // Índices de Libros
    await database.collection('libros').createIndex({ isbn: 1 }, { unique: true });
    await database.collection('libros').createIndex({ titulo: 'text', autor: 'text', categoria: 'text' });

    // Índices de Préstamos
    await database.collection('prestamos').createIndex({ 'usuario.identificacion': 1 });
    await database.collection('prestamos').createIndex({ 'libro.id': 1 });
    await database.collection('prestamos').createIndex({ estado: 1 });

    // Índices de Ventas
    await database.collection('ventas').createIndex({ 'cliente.identificacion': 1 });
    await database.collection('ventas').createIndex({ fecha: -1 });

    console.log('📌 Índices de MongoDB creados y verificados satisfactoriamente.');
  } catch (indexError) {
    console.warn('⚠️ Nota sobre índices:', indexError.message);
  }
};

/**
 * Cierre limpio de la conexión al apagar el servidor
 */
export const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('🔒 Conexión a MongoDB cerrada.');
  }
};
