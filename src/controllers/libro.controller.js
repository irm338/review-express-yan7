import { LibroModel } from '../models/libro.model.js';

export class LibroController {
  /**
   * Crear un nuevo libro (Solo Admin)
   */
  static async crear(req, res, next) {
    try {
      const { isbn } = req.body;

      // Verificar si ya existe un libro con ese ISBN
      const existing = await LibroModel.findByIsbn(isbn);
      if (existing) {
        return res.status(409).json({
          status: 'fail',
          message: `Ya existe un libro registrado con el ISBN '${isbn}'`
        });
      }

      const libro = await LibroModel.create(req.body);

      res.status(201).json({
        status: 'success',
        message: 'Libro creado exitosamente en el inventario',
        libro
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los libros con paginación y filtros
   */
  static async listar(req, res, next) {
    try {
      const resultado = await LibroModel.findAll(req.query);

      res.status(200).json({
        status: 'success',
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar libros por término (título, autor, categoría, isbn)
   */
  static async buscar(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Debe proporcionar un parámetro de búsqueda (?q=término)'
        });
      }

      const libros = await LibroModel.search(q.trim());

      res.status(200).json({
        status: 'success',
        total: libros.length,
        busqueda: q,
        libros
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalle de un libro por su ID
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const libro = await LibroModel.findById(id);

      if (!libro) {
        return res.status(404).json({
          status: 'fail',
          message: `Libro con ID '${id}' no encontrado`
        });
      }

      res.status(200).json({
        status: 'success',
        libro
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Editar libro (Solo Admin)
   */
  static async editar(req, res, next) {
    try {
      const { id } = req.params;

      const libroActualizado = await LibroModel.update(id, req.body);

      if (!libroActualizado) {
        return res.status(404).json({
          status: 'fail',
          message: `Libro con ID '${id}' no encontrado o no pudo actualizarse`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Libro e inventario actualizados correctamente',
        libro: libroActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un libro (Solo Admin)
   */
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      const eliminado = await LibroModel.delete(id);

      if (!eliminado) {
        return res.status(404).json({
          status: 'fail',
          message: `Libro con ID '${id}' no encontrado o ya fue eliminado`
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Libro eliminado exitosamente del inventario'
      });
    } catch (error) {
      next(error);
    }
  }
}
