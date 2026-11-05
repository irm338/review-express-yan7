import bcrypt from 'bcryptjs';
import { connectDB, closeDB, getDB } from '../config/db.js';

const seedDatabase = async () => {
  try {
    const db = await connectDB();
    console.log('🌱 Iniciando siembra (seeding) de la base de datos...');

    // Limpiar colecciones previas
    await db.collection('usuarios').deleteMany({});
    await db.collection('libros').deleteMany({});
    await db.collection('prestamos').deleteMany({});
    await db.collection('ventas').deleteMany({});

    // 1. Crear Contraseñas Hasheadas
    const passwordAdmin = await bcrypt.hash('Admin123*', 10);
    const passwordUsuario = await bcrypt.hash('User123*', 10);

    // 2. Insertar Usuarios
    const usuarios = [
      {
        identificacion: '1001',
        nombre: 'Edwin Salas (Admin)',
        tel: '3001234567',
        dir: 'Calle 10 # 20-30, Bucaramanga',
        email: 'admin@campuslands.com',
        password: passwordAdmin,
        rol: 'admin',
        createdAt: new Date()
      },
      {
        identificacion: '1002',
        nombre: 'Irma Yaneht Arias García',
        tel: '3159876543',
        dir: 'Carrera 15 # 45-60, Bucaramanga',
        email: 'yanehtarias12@gmail.com',
        password: passwordUsuario,
        rol: 'usuario',
        createdAt: new Date()
      },
      {
        identificacion: '1003',
        nombre: 'Carlos Mendoza',
        tel: '3114567890',
        dir: 'Avenida Santander # 12-40, Floridablanca',
        email: 'carlos@campuslands.com',
        password: passwordUsuario,
        rol: 'usuario',
        createdAt: new Date()
      }
    ];
    await db.collection('usuarios').insertMany(usuarios);
    console.log(`✅ ${usuarios.length} Usuarios creados.`);

    // 3. Insertar Libros e Inventario
    const libros = [
      {
        isbn: '978-0132350884',
        titulo: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        autor: 'Robert C. Martin',
        editorial: 'Prentice Hall',
        categoria: 'Desarrollo de Software',
        anioPublicacion: 2008,
        precioVenta: 120000,
        cantidadDisponible: 10,
        estado: 'disponible',
        createdAt: new Date()
      },
      {
        isbn: '978-0596517748',
        titulo: 'JavaScript: The Good Parts',
        autor: 'Douglas Crockford',
        editorial: "O'Reilly Media",
        categoria: 'Programación',
        anioPublicacion: 2008,
        precioVenta: 95000,
        cantidadDisponible: 8,
        estado: 'disponible',
        createdAt: new Date()
      },
      {
        isbn: '978-1449340131',
        titulo: 'Node.js in Action',
        autor: 'Mike Cantelon, Marc Harter',
        editorial: 'Manning',
        categoria: 'Backend',
        anioPublicacion: 2017,
        precioVenta: 110000,
        cantidadDisponible: 5,
        estado: 'disponible',
        createdAt: new Date()
      },
      {
        isbn: '978-0307474728',
        titulo: 'Cien Años de Soledad',
        autor: 'Gabriel García Márquez',
        editorial: 'Sudamericana',
        categoria: 'Literatura Clásica',
        anioPublicacion: 1967,
        precioVenta: 65000,
        cantidadDisponible: 12,
        estado: 'disponible',
        createdAt: new Date()
      },
      {
        isbn: '978-8424116088',
        titulo: 'Don Quijote de la Mancha',
        autor: 'Miguel de Cervantes',
        editorial: 'Espasa',
        categoria: 'Novela',
        anioPublicacion: 1605,
        precioVenta: 75000,
        cantidadDisponible: 4,
        estado: 'disponible',
        createdAt: new Date()
      },
      {
        isbn: '978-0156012195',
        titulo: 'El Principito',
        autor: 'Antoine de Saint-Exupéry',
        editorial: 'Reynal & Hitchcock',
        categoria: 'Fábula',
        anioPublicacion: 1943,
        precioVenta: 45000,
        cantidadDisponible: 15,
        estado: 'disponible',
        createdAt: new Date()
      }
    ];
    const librosInsertados = await db.collection('libros').insertMany(libros);
    console.log(`✅ ${libros.length} Libros creados.`);

    const libro1Id = librosInsertados.insertedIds[0];
    const libro2Id = librosInsertados.insertedIds[1];

    // 4. Insertar Préstamos de prueba
    const fechaHoy = new Date();
    const fechaTentativa = new Date();
    fechaTentativa.setDate(fechaHoy.getDate() + 15);

    const prestamos = [
      {
        libro: {
          id: libro1Id,
          isbn: libros[0].isbn,
          titulo: libros[0].titulo
        },
        usuario: {
          identificacion: '1002',
          nombre: 'Irma Yaneht Arias García',
          email: 'yanehtarias12@gmail.com'
        },
        fechaPrestamo: fechaHoy,
        fechaTentativaDevol: fechaTentativa,
        fechaDevol: null,
        estado: 'PRESTADO',
        observaciones: 'Préstamo académico inicial'
      }
    ];
    await db.collection('prestamos').insertMany(prestamos);
    console.log(`✅ ${prestamos.length} Préstamos de prueba creados.`);

    // 5. Insertar Ventas de prueba
    const ventas = [
      {
        cliente: {
          identificacion: '1002',
          nombre: 'Irma Yaneht Arias García',
          email: 'yanehtarias12@gmail.com',
          tel: '3159876543'
        },
        libros: [
          {
            libroId: libro2Id,
            titulo: libros[1].titulo,
            isbn: libros[1].isbn,
            cantidad: 1,
            precioUnitario: libros[1].precioVenta,
            subtotal: libros[1].precioVenta
          }
        ],
        total: libros[1].precioVenta,
        fecha: new Date(),
        metodoPago: 'efectivo'
      }
    ];
    await db.collection('ventas').insertMany(ventas);
    console.log(`✅ ${ventas.length} Ventas de prueba creadas.`);

    console.log('🎉 Base de datos sembrada con éxito!');
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
  } finally {
    await closeDB();
    process.exit(0);
  }
};

seedDatabase();
