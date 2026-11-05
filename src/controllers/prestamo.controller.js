import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// ============================================================================
// Rol: Admin -> Prestar Libros
// Campos: Libro, Fecha de préstamo, fecha tentativa de devol, Fecha Devol, usuario
// Control de inventario: Descuenta 1 stock al prestar y suma 1 stock al devolver
// ============================================================================

// 1. Registrar Préstamo de Libro
export const prestarLibro = async (req, res) => {
  try {
    const { libroId, usuarioIdentificacion, fechaTentativaDevol } = req.body;
    const db = getDB();

    // Paso 1: Verificar que el libro exista en la base de datos
    const libro = await db.collection('libros').findOne({ _id: new ObjectId(libroId) });
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado en el catálogo' });
    }

    // Paso 2: Verificar si hay unidades disponibles en el inventario
    if (libro.cantidadDisponible <= 0) {
      return res.status(400).json({ error: `El libro "${libro.titulo}" está agotado en inventario` });
    }

    // Paso 3: Verificar que el usuario exista
    const usuario = await db.collection('usuarios').findOne({ identificacion: usuarioIdentificacion });
    if (!usuario) {
      return res.status(404).json({ error: `Usuario con identificación "${usuarioIdentificacion}" no encontrado` });
    }

    // Paso 4: Descontar 1 ejemplar del inventario del libro
    await db.collection('libros').updateOne(
      { _id: new ObjectId(libroId) },
      { $inc: { cantidadDisponible: -1 } }
    );

    // Paso 5: Guardar el documento del préstamo
    const nuevoPrestamo = {
      libro: {
        id: libro._id,
        titulo: libro.titulo,
        isbn: libro.isbn
      },
      fechaPrestamo: new Date(),
      fechaTentativaDevol: new Date(fechaTentativaDevol),
      fechaDevol: null, // Fecha de devolución inicial es null (libro aún prestado)
      usuario: {
        identificacion: usuario.identificacion,
        nombre: usuario.nombre,
        email: usuario.email
      },
      estado: 'PRESTADO'
    };

    const resultado = await db.collection('prestamos').insertOne(nuevoPrestamo);

    res.status(201).json({
      mensaje: 'Préstamo registrado exitosamente y stock de inventario actualizado',
      prestamoId: resultado.insertedId,
      prestamo: nuevoPrestamo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Registrar Devolución de Libro
export const devolverLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Paso 1: Buscar el préstamo
    const prestamo = await db.collection('prestamos').findOne({ _id: new ObjectId(id) });
    if (!prestamo) {
      return res.status(404).json({ error: 'Préstamo no encontrado' });
    }

    // Paso 2: Verificar si ya había sido devuelto
    if (prestamo.fechaDevol) {
      return res.status(400).json({ error: 'Este libro ya fue devuelto con anterioridad' });
    }

    // Paso 3: Asignar la Fecha Devol real y marcar como DEVUELTO
    await db.collection('prestamos').updateOne(
      { _id: new ObjectId(id) },
      { $set: { fechaDevol: new Date(), estado: 'DEVUELTO' } }
    );

    // Paso 4: Devolver 1 ejemplar al inventario del libro
    await db.collection('libros').updateOne(
      { _id: new ObjectId(prestamo.libro.id) },
      { $inc: { cantidadDisponible: 1 } }
    );

    res.status(200).json({
      mensaje: 'Devolución registrada exitosamente y stock de inventario reincorporado'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Listar todos los préstamos (Admin)
export const listarPrestamos = async (req, res) => {
  try {
    const db = getDB();
    const prestamos = await db.collection('prestamos').find().toArray();
    res.status(200).json(prestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
