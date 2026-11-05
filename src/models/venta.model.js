import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db.js';

export class VentaModel {
  static collection() {
    return getCollection('ventas');
  }

  /**
   * Crear un nuevo registro de venta
   */
  static async create(ventaData) {
    const doc = {
      cliente: {
        identificacion: String(ventaData.cliente.identificacion),
        nombre: ventaData.cliente.nombre,
        email: ventaData.cliente.email,
        tel: ventaData.cliente.tel,
        dir: ventaData.cliente.dir
      },
      libros: ventaData.libros.map((item) => ({
        libroId: item.libroId,
        isbn: item.isbn,
        titulo: item.titulo,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario),
        subtotal: Number(item.subtotal)
      })),
      total: Number(ventaData.total),
      fecha: ventaData.fecha ? new Date(ventaData.fecha) : new Date(),
      metodoPago: ventaData.metodoPago || 'efectivo',
      createdAt: new Date()
    };

    const result = await this.collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  /**
   * Buscar venta por ID
   */
  static async findById(id) {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;
      return await this.collection().findOne({ _id: objId });
    } catch {
      return null;
    }
  }

  /**
   * Listar todas las ventas (Admin) con filtros y paginación
   */
  static async findAll(query = {}) {
    const { clienteIdentificacion, fechaInicio, fechaFin, page = 1, limit = 20 } = query;
    const filter = {};

    if (clienteIdentificacion) {
      filter['cliente.identificacion'] = String(clienteIdentificacion);
    }

    if (fechaInicio || fechaFin) {
      filter.fecha = {};
      if (fechaInicio) filter.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filter.fecha.$lte = new Date(fechaFin);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      this.collection()
        .find(filter)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(Number(limit))
        .toArray(),
      this.collection().countDocuments(filter)
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    };
  }

  /**
   * Buscar ventas (compras) de un cliente específico
   */
  static async findByClienteIdentificacion(identificacion) {
    return await this.collection()
      .find({ 'cliente.identificacion': String(identificacion) })
      .sort({ fecha: -1 })
      .toArray();
  }
}
