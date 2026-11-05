import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// Rol: Admin -> Venta Libros (Cliente, Libros 1 o varios, Fecha)

// 1. Registrar Venta
export const registrarVenta = async (req, res) => {
  try {
    const { clienteIdentificacion, libros: items } = req.body;
    const db = getDB();

    // Validar cliente
    const cliente = await db.collection('usuarios').findOne({ identificacion: clienteIdentificacion });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    let total = 0;
    const detalleLibros = [];

    // Validar cada libro y su stock disponible
    for (const item of items) {
      const libro = await db.collection('libros').findOne({ _id: new ObjectId(item.libroId) });
      if (!libro) return res.status(404).json({ error: `Libro con ID ${item.libroId} no existe` });

      const cantidad = Number(item.cantidad) || 1;
      if (libro.cantidadDisponible < cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el libro: ${libro.titulo}` });
      }

      const subtotal = libro.precioVenta * cantidad;
      total += subtotal;

      detalleLibros.push({
        libroId: libro._id,
        titulo: libro.titulo,
        cantidad,
        precioUnitario: libro.precioVenta,
        subtotal
      });
    }

    // Descontar del inventario cada libro
    for (const item of detalleLibros) {
      await db.collection('libros').updateOne(
        { _id: new ObjectId(item.libroId) },
        { $inc: { cantidadDisponible: -item.cantidad } }
      );
    }

    // Guardar la venta según el requerimiento
    const nuevaVenta = {
      cliente: {
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        email: cliente.email
      },
      libros: detalleLibros,
      fecha: new Date(),
      total
    };

    const resultado = await db.collection('ventas').insertOne(nuevaVenta);
    res.status(201).json({ mensaje: 'Venta registrada con éxito', ventaId: resultado.insertedId, venta: nuevaVenta });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Listar todas las ventas (Admin)
export const listarVentas = async (req, res) => {
  try {
    const db = getDB();
    const ventas = await db.collection('ventas').find().toArray();
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
