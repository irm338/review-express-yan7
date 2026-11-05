import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'biblioteca_campus';

const seed = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log('🌱 Sembrando base de datos con datos básicos de prueba...');

    // Limpiar colecciones
    await db.collection('usuarios').deleteMany({});
    await db.collection('libros').deleteMany({});
    await db.collection('prestamos').deleteMany({});
    await db.collection('ventas').deleteMany({});

    // Crear Contraseñas
    const passAdmin = await bcrypt.hash('Admin123*', 10);
    const passUser = await bcrypt.hash('User123*', 10);

    // 1. Usuarios
    const usuarios = [
      {
        identificacion: '1001',
        nombre: 'Edwin Salas (Admin)',
        tel: '3001234567',
        dir: 'Calle 10 # 20-30',
        email: 'admin@campuslands.com',
        password: passAdmin,
        rol: 'admin',
        createdAt: new Date()
      },
      {
        identificacion: '1002',
        nombre: 'Irma Yaneht Arias García',
        tel: '3159876543',
        dir: 'Carrera 15 # 45-60',
        email: 'yanehtarias12@gmail.com',
        password: passUser,
        rol: 'usuario',
        createdAt: new Date()
      }
    ];
    await db.collection('usuarios').insertMany(usuarios);

    // 2. Libros e Inventario
    const libros = [
      {
        isbn: '978-0132350884',
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        editorial: 'Prentice Hall',
        categoria: 'Software',
        anioPublicacion: 2008,
        precioVenta: 120000,
        cantidadDisponible: 10,
        createdAt: new Date()
      },
      {
        isbn: '978-0596517748',
        titulo: 'JavaScript: The Good Parts',
        autor: 'Douglas Crockford',
        editorial: "O'Reilly",
        categoria: 'Programación',
        anioPublicacion: 2008,
        precioVenta: 95000,
        cantidadDisponible: 8,
        createdAt: new Date()
      },
      {
        isbn: '978-0307474728',
        titulo: 'Cien Años de Soledad',
        autor: 'Gabriel García Márquez',
        editorial: 'Sudamericana',
        categoria: 'Literatura',
        anioPublicacion: 1967,
        precioVenta: 65000,
        cantidadDisponible: 12,
        createdAt: new Date()
      }
    ];
    await db.collection('libros').insertMany(libros);

    console.log('✅ Base de datos sembrada con éxito: Usuarios y Libros creados.');
  } catch (error) {
    console.error('Error al sembrar:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
};

seed();
