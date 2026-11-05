import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// Rol: Admin -> Gestionar libros (Crear, editar, listar, buscar, eliminar)

// 1. Crear Libro
export const crearLibro = async (req, res) => {
  try {
    const db = getDB();
    const nuevoLibro = {
      ...req.body,
      anioPublicacion: Number(req.body.anioPublicacion),
      precioVenta: Number(req.body.precioVenta),
      cantidadDisponible: Number(req.body.cantidadDisponible),
      createdAt: new Date()
    };

    const resultado = await db.collection('libros').insertOne(nuevoLibro);
    res.status(201).json({ mensaje: 'Libro creado con éxito', libroId: resultado.insertedId, libro: nuevoLibro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Listar Libros
export const listarLibros = async (req, res) => {
  try {
    const db = getDB();
    const libros = await db.collection('libros').find().toArray();
    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Buscar Libros (por título, autor o categoría)
export const buscarLibros = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino) {
      return res.status(400).json({ error: 'Debe enviar un término de búsqueda: ?termino=algo' });
    }

    const db = getDB();
    const regex = new RegExp(termino, 'i');
    const libros = await db.collection('libros').find({
      $or: [{ titulo: regex }, { autor: regex }, { categoria: regex }]
    }).toArray();

    res.status(200).json(libros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Editar Libro
export const editarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const datosActualizar = { ...req.body };
    delete datosActualizar._id;

    if (datosActualizar.precioVenta) datosActualizar.precioVenta = Number(datosActualizar.precioVenta);
    if (datosActualizar.cantidadDisponible) datosActualizar.cantidadDisponible = Number(datosActualizar.cantidadDisponible);

    await db.collection('libros').updateOne(
      { _id: new ObjectId(id) },
      { $set: datosActualizar }
    );

    res.status(200).json({ mensaje: 'Libro actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Eliminar Libro
export const eliminarLibro = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    await db.collection('libros').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ mensaje: 'Libro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
