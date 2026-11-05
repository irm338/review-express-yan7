import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Módulo 2: Conexión a la base de datos MongoDB con el driver nativo
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'biblioteca_campus';

let baseDeDatos = null;

export const connectDB = async () => {
  try {
    const cliente = new MongoClient(uri);
    await cliente.connect();
    baseDeDatos = cliente.db(dbName);
    console.log(`✅ Conexión exitosa a la base de datos MongoDB: [${dbName}]`);
    return baseDeDatos;
  } catch (error) {
    console.error(`❌ Error en la conexión a MongoDB: ${error.message}`);
  }
};

// Función para obtener la instancia de la base de datos desde los controladores
export const getDB = () => {
  return baseDeDatos;
};
