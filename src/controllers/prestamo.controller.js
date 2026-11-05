import { PrestamoModel } from '../models/prestamo.model.js';
import { LibroModel } from '../models/libro.model.js';
import { UsuarioModel } from '../models/usuario.model.js';

export class PrestamoController {
  /**
   * Registrar un nuevo préstamo (Solo Admin)
   * Valida stock del libro, descuenta inventario y asocia usuario
   */
  static async crearPrestamo(req, res, next) {
    try {
      const { libroId, usuarioIdentificacion, fechaPrestamo, fechaTentativaDevol, observaciones } = req.body;

      // 1. Validar que el usuario exista
      const usuario = await UsuarioModel.findByIdentificacion(usuarioIdentificacion);
      if (!usuario) {
        return res.status(404).json({
          status: 'fail',
          message: `Usuario con identificación '${usuarioIdentificacion}' no encontrado`
        });
      }

      // 2. Validar que el libro exista y tenga inventario disponible
      const libro = await LibroModel.findById(libroId);
      if (!libro) {
        return res.status(404).json({
          status: 'fail',
          message: `Libro con ID '${libroId}' no encontrado`
        });
      }

      if (libro.cantidadDisponible <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: `El libro '${libro.titulo}' no tiene ejemplares disponibles para préstamo (Stock agotado)`
        });
      }

      // 3. Descontar 1 unidad de stock en inventario
      const libroActualizado = await LibroModel.updateStock(libroId, -1);
      if (!libroActualizado) {
        return res.status(400).json({
          status: 'fail',
          message: 'No se pudo actualizar el inventario del libro (Stock insuficiente)'
        });
      }

      // 4. Crear el registro del préstamo
      const prestamo = await PrestamoModel.create({
        libro: {
          id: libro._id,
          isbn: libro.isbn,
          titulo: libro.titulo,
          autor: libro.autor
        },
        usuario: {
          identificacion: usuario.identificacion,
          nombre: usuario.nombre,
          email: usuario.email,
          tel: usuario.tel
        },
        fechaPrestamo: fechaPrestamo || new Date(),
        fechaTentativaDevol,
        observaciones
      });

      res.status(201).json({
        status: 'success',
        message: 'Préstamo registrado exitosamente y stock de inventario actualizado',
        prestamo,
        stockRestante: libroActualizado.cantidadDisponible
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registrar devolución de libro (Solo Admin)
   * Actualiza fecha de devolución real y reintegra stock de inventario
   */
  static async registrarDevolucion(req, res, next) {
    try {
      const { id } = req.params;
      const { fechaDevol, observaciones } = req.body;

      // 1. Buscar el préstamo existente
      const prestamo = await PrestamoModel.findById(id);
      if (!prestamo) {
        return res.status(404).json({
          status: 'fail',
          message: `Préstamo con ID '${id}' no encontrado`
        });
      }

      if (prestamo.estado === 'DEVUELTO') {
        return res.status(400).json({
          status: 'fail',
          message: `Este libro ya fue devuelto previamente el ${new Date(prestamo.fechaDevol).toLocaleDateString()}`
        });
      }

      // 2. Registrar devolución
      const prestamoActualizado = await PrestamoModel.registrarDevolucion(
        id,
        fechaDevol || new Date(),
        observaciones
      );

      // 3. Reintegrar 1 unidad al stock de inventario del libro
      const libroActualizado = await LibroModel.updateStock(prestamo.libro.id, 1);

      res.status(200).json({
        status: 'success',
        message: 'Devolución registrada exitosamente y stock reincorporado al inventario',
        prestamo: prestamoActualizado,
        stockActual: libroActualizado?.cantidadDisponible
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los préstamos (Solo Admin)
   */
  static async listarTodos(req, res, next) {
    try {
      const resultado = await PrestamoModel.findAll(req.query);
      res.status(200).json({
        status: 'success',
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalle de un préstamo por ID
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const prestamo = await PrestamoModel.findById(id);

      if (!prestamo) {
        return res.status(404).json({
          status: 'fail',
          message: `Préstamo con ID '${id}' no encontrado`
        });
      }

      // Si no es admin y el préstamo no es suyo, denegar
      if (req.user.rol !== 'admin' && req.user.identificacion !== prestamo.usuario.identificacion) {
        return res.status(403).json({
          status: 'fail',
          message: 'No tiene permisos para ver este préstamo ajeno'
        });
      }

      res.status(200).json({
        status: 'success',
        prestamo
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Buscar préstamos de un usuario por su identificación (Admin)
   */
  static async listarPorUsuario(req, res, next) {
    try {
      const { identificacion } = req.params;
      const prestamos = await PrestamoModel.findByUsuarioIdentificacion(identificacion);

      res.status(200).json({
        status: 'success',
        total: prestamos.length,
        identificacion,
        prestamos
      });
    } catch (error) {
      next(error);
    }
  }
}
