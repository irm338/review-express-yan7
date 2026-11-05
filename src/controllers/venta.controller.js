import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

// ============================================================================
// Rol: Admin -> Venta Libros
// Campos: Cliente, Libros (1 o varios), Fecha, Total
// Control de inventario: Descuenta las cantidades vendidas de cada libro
// ============================================================================

// 1. Registrar Venta de 1 o varios libros
export const registrarVenta = async (req, res) => {
  try {
    const { clienteIdentificacion, libros: items } = req.body;
    const db = getDB();

    // Paso 1: Validar que el cliente exista
    const cliente = await db.collection('usuarios').findOne({ identificacion: clienteIdentificacion });
    if (!cliente) {
      return res.status(404).json({ error: `Cliente con identificación "${clienteIdentificacion}" no encontrado` });
    }

    let totalVenta = 0;
    const listaLibrosVendidos = [];

    // Paso 2: Validar la existencia y stock de cada libro solicitado
    for (const item of items) {
      const libro = await db.collection('libros').findOne({ _id: new ObjectId(item.libroId) });
      if (!libro) {
        return res.status(404).json({ error: `Libro con ID ${item.libroId} no existe en inventario` });
      }

      const cantidad = Number(item.cantidad) || 1;
      if (libro.cantidadDisponible < cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para "${libro.titulo}". Solicitados: ${cantidad}, Disponibles: ${libro.cantidadDisponible}`
        });
      }

      const subtotal = libro.precioVenta * cantidad;
      totalVenta += subtotal;

      listaLibrosVendidos.push({
        libroId: libro._id,
        titulo: libro.titulo,
        cantidad,
        precioUnitario: libro.precioVenta,
        subtotal
      });
    }

    // Paso 3: Descontar el stock vendido de cada libro en el inventario
    for (const item of listaLibrosVendidos) {
      await db.collection('libros').updateOne(
        { _id: new ObjectId(item.libroId) },
        { $inc: { cantidadDisponible: -item.cantidad } }
      );
    }

    // Paso 4: Guardar la venta con Cliente, Libros y Fecha
    const nuevaVenta = {
      cliente: {
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        email: cliente.email
      },
      libros: listaLibrosVendidos,
      fecha: new Date(),
      total: totalVenta
    };

    const resultado = await db.collection('ventas').insertOne(nuevaVenta);

    res.status(201).json({
      mensaje: 'Venta registrada con éxito y stock descontado',
      ventaId: resultado.insertedId,
      venta: nuevaVenta
    });
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
