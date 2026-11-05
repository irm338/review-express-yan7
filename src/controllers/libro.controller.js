import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// ============================================================================
// Rol: Admin -> Gestionar libros (Crear, editar, listar, buscar, eliminar)
// Datos de libros e inventario (isbn, titulo, autor, editorial, categoria, precio, stock)
// ============================================================================

// 1. Crear Libro en el inventario
export const crearLibro = async (req, res) => {
  try {
    const db = getDB();
    const nuevoLibro = {
      isbn: req.body.isbn,
      titulo: req.body.titulo,
      autor: req.body.autor,
      editorial: req.body.editorial,
      categoria: req.body.categoria,
      anioPublicacion: Number(req.body.anioPublicacion),
      precioVenta: Number(req.body.precioVenta),
      cantidadDisponible: Number(req.body.cantidadDisponible), // Stock en inventario
      createdAt: new Date()
    };

    const resultado = await db.collection('libros').insertOne(nuevoLibro);
    res.status(201).json({
      mensaje: 'Libro creado exitosamente en el inventario',
      libroId: resultado.insertedId,
      libro: nuevoLibro
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Listar todos los libros
export const listarLibros = async (req, res) => {
  try {
    const db = getDB();
    const libros = await db.collection('libros').find().toArray();
    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Buscar Libros (por título, autor o categoría con término flexible)
export const buscarLibros = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino) {
      return res.status(400).json({ error: 'Debe especificar el parámetro de búsqueda: ?termino=texto' });
    }

    const db = getDB();
    const patron = new RegExp(termino, 'i'); // 'i' para ignorar mayúsculas y minúsculas

    const libros = await db.collection('libros').find({
      $or: [
        { titulo: patron },
        { autor: patron },
        { categoria: patron },
        { isbn: patron }
      ]
    }).toArray();

    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Editar Libro e inventario por ID
export const editarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const camposActualizar = { ...req.body };
    delete camposActualizar._id; // Proteger el _id de MongoDB

    if (camposActualizar.precioVenta) camposActualizar.precioVenta = Number(camposActualizar.precioVenta);
    if (camposActualizar.cantidadDisponible) camposActualizar.cantidadDisponible = Number(camposActualizar.cantidadDisponible);

    await db.collection('libros').updateOne(
      { _id: new ObjectId(id) },
      { $set: camposActualizar }
    );

    res.status(200).json({ mensaje: 'Libro actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Eliminar Libro del inventario por ID
export const eliminarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    await db.collection('libros').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ mensaje: 'Libro eliminado del inventario' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
