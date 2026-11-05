import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// Rol: Admin -> Prestar Libros y registrar devoluciones

// 1. Prestar Libro
export const prestarLibro = async (req, res) => {
  try {
    const { libroId, usuarioIdentificacion, fechaTentativaDevol } = req.body;
    const db = getDB();

    // Validar libro
    const libro = await db.collection('libros').findOne({ _id: new ObjectId(libroId) });
    if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
    if (libro.cantidadDisponible <= 0) return res.status(400).json({ error: 'No hay ejemplares disponibles en el inventario' });

    // Validar usuario
    const usuario = await db.collection('usuarios').findOne({ identificacion: usuarioIdentificacion });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Descontar 1 del inventario
    await db.collection('libros').updateOne(
      { _id: new ObjectId(libroId) },
      { $inc: { cantidadDisponible: -1 } }
    );

    // Guardar préstamo según los campos del requerimiento
    const nuevoPrestamo = {
      libro: {
        id: libro._id,
        titulo: libro.titulo,
        isbn: libro.isbn
      },
      fechaPrestamo: new Date(),
      fechaTentativaDevol: new Date(fechaTentativaDevol),
      fechaDevol: null, // Pendiente de devolución
      usuario: {
        identificacion: usuario.identificacion,
        nombre: usuario.nombre,
        email: usuario.email
      },
      estado: 'PRESTADO'
    };

    const resultado = await db.collection('prestamos').insertOne(nuevoPrestamo);
    res.status(201).json({ mensaje: 'Préstamo registrado exitosamente', prestamoId: resultado.insertedId, prestamo: nuevoPrestamo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Registrar Devolución de Libro
export const devolverLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const prestamo = await db.collection('prestamos').findOne({ _id: new ObjectId(id) });
    if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (prestamo.fechaDevol) return res.status(400).json({ error: 'Este libro ya fue devuelto' });

    // Registrar fecha real de devolución y cambiar estado
    await db.collection('prestamos').updateOne(
      { _id: new ObjectId(id) },
      { $set: { fechaDevol: new Date(), estado: 'DEVUELTO' } }
    );

    // Reintegrar 1 al inventario del libro
    await db.collection('libros').updateOne(
      { _id: new ObjectId(prestamo.libro.id) },
      { $inc: { cantidadDisponible: 1 } }
    );

    res.status(200).json({ mensaje: 'Libro devuelto con éxito e inventario actualizado' });
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
