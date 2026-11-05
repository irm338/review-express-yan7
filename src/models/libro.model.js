import { ObjectId } from 'mongodb';
import { getCollection } from '../config/db.js';

export class LibroModel {
  static collection() {
    return getCollection('libros');
  }

  /**
   * Crear un nuevo libro con su inventario
   */
  static async create(libroData) {
    const doc = {
      isbn: String(libroData.isbn).trim(),
      titulo: String(libroData.titulo).trim(),
      autor: String(libroData.autor).trim(),
      editorial: String(libroData.editorial).trim(),
      categoria: String(libroData.categoria).trim(),
      anioPublicacion: Number(libroData.anioPublicacion),
      precioVenta: Number(libroData.precioVenta),
      cantidadDisponible: Number(libroData.cantidadDisponible),
      estado: libroData.cantidadDisponible > 0 ? 'disponible' : 'agotado',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  /**
   * Buscar libro por ID
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
   * Buscar libro por ISBN
   */
  static async findByIsbn(isbn) {
    return await this.collection().findOne({ isbn: String(isbn).trim() });
  }

  /**
   * Listar todos los libros con filtros y paginación
   */
  static async findAll(query = {}) {
    const { page = 1, limit = 20, categoria, estado, search } = query;
    const filter = {};

    if (categoria) {
      filter.categoria = new RegExp(categoria, 'i');
    }

    if (estado) {
      filter.estado = estado;
    }

    if (search) {
      filter.$or = [
        { titulo: new RegExp(search, 'i') },
        { autor: new RegExp(search, 'i') },
        { categoria: new RegExp(search, 'i') },
        { isbn: new RegExp(search, 'i') }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      this.collection()
        .find(filter)
        .sort({ createdAt: -1 })
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
   * Buscar libros por término de búsqueda (título, autor, categoría)
   */
  static async search(term) {
    const regex = new RegExp(term, 'i');
    return await this.collection()
      .find({
        $or: [
          { titulo: regex },
          { autor: regex },
          { categoria: regex },
          { editorial: regex },
          { isbn: regex }
        ]
      })
      .toArray();
  }

  /**
   * Actualizar datos de un libro
   */
  static async update(id, updateData) {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;
      const safeData = { ...updateData };
      delete safeData._id;

      if (safeData.cantidadDisponible !== undefined) {
        safeData.cantidadDisponible = Number(safeData.cantidadDisponible);
        safeData.estado = safeData.cantidadDisponible > 0 ? 'disponible' : 'agotado';
      }

      safeData.updatedAt = new Date();

      const result = await this.collection().findOneAndUpdate(
        { _id: objId },
        { $set: safeData },
        { returnDocument: 'after' }
      );

      return result;
    } catch {
      return null;
    }
  }

  /**
   * Actualizar stock de inventario (incrementar o decrementar de forma atómica)
   * @param {string} id
   * @param {number} delta - Puede ser positivo (+1 devolución) o negativo (-1 préstamo/venta)
   */
  static async updateStock(id, delta) {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;

      // Si es reducción, verificar que haya suficiente stock
      const query = { _id: objId };
      if (delta < 0) {
        query.cantidadDisponible = { $gte: Math.abs(delta) };
      }

      const result = await this.collection().findOneAndUpdate(
        query,
        {
          $inc: { cantidadDisponible: delta },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );

      if (result) {
        // Actualizar estado 'agotado' o 'disponible' según el nuevo stock
        const nuevoEstado = result.cantidadDisponible > 0 ? 'disponible' : 'agotado';
        await this.collection().updateOne({ _id: objId }, { $set: { estado: nuevoEstado } });
        result.estado = nuevoEstado;
      }

      return result;
    } catch {
      return null;
    }
  }

  /**
   * Eliminar un libro por ID
   */
  static async delete(id) {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await this.collection().deleteOne({ _id: objId });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }
}
