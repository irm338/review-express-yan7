import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Módulo 2: Conexión a la base de datos MongoDB
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'biblioteca_campus';

let db = null;

export const connectDB = async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ Conectado exitosamente a MongoDB: [${dbName}]`);
    return db;
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB: ${error.message}`);
  }
};

export const getDB = () => db;
