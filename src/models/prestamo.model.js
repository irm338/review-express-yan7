import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db.js';

export class PrestamoModel {
  static collection() {
    return getCollection('prestamos');
  }

  /**
   * Crear un nuevo préstamo
   */
  static async create(prestamoData) {
    const doc = {
      libro: {
        id: prestamoData.libro.id,
        isbn: prestamoData.libro.isbn,
        titulo: prestamoData.libro.titulo,
        autor: prestamoData.libro.autor
      },
      usuario: {
        identificacion: String(prestamoData.usuario.identificacion),
        nombre: prestamoData.usuario.nombre,
        email: prestamoData.usuario.email,
        tel: prestamoData.usuario.tel
      },
      fechaPrestamo: prestamoData.fechaPrestamo ? new Date(prestamoData.fechaPrestamo) : new Date(),
      fechaTentativaDevol: new Date(prestamoData.fechaTentativaDevol),
      fechaDevol: null, // Pendiente de devolución
      estado: 'PRESTADO', // 'PRESTADO' | 'DEVUELTO'
      observaciones: prestamoData.observaciones || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  /**
   * Buscar préstamo por ID
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
   * Registrar devolución de un libro prestado
   */
  static async registrarDevolucion(id, fechaDevol = new Date(), observaciones = '') {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;

      const updateFields = {
        fechaDevol: new Date(fechaDevol),
        estado: 'DEVUELTO',
        updatedAt: new Date()
      };

      if (observaciones) {
        updateFields.observacionesDevolucion = observaciones;
      }

      const result = await this.collection().findOneAndUpdate(
        { _id: objId, estado: 'PRESTADO' },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      return result;
    } catch {
      return null;
    }
  }

  /**
   * Listar todos los préstamos (Admin) con filtros
   */
  static async findAll(query = {}) {
    const { estado, identificacion, page = 1, limit = 20 } = query;
    const filter = {};

    if (estado) {
      filter.estado = estado.toUpperCase();
    }

    if (identificacion) {
      filter['usuario.identificacion'] = String(identificacion);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      this.collection()
        .find(filter)
        .sort({ fechaPrestamo: -1 })
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
   * Buscar préstamos de un usuario específico
   */
  static async findByUsuarioIdentificacion(identificacion) {
    return await this.collection()
      .find({ 'usuario.identificacion': String(identificacion) })
      .sort({ fechaPrestamo: -1 })
      .toArray();
  }
}
