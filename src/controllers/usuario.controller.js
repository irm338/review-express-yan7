import { UsuarioModel } from '../models/usuario.model.js';
import { PrestamoModel } from '../models/prestamo.model.js';
import { VentaModel } from '../models/venta.model.js';

export class UsuarioController {
  /**
   * Obtener perfil del usuario autenticado
   */
  static async obtenerPerfil(req, res, next) {
    try {
      const usuario = await UsuarioModel.findByIdentificacion(req.user.identificacion);

      if (!usuario) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado'
        });
      }

      const { password, ...perfil } = usuario;

      res.status(200).json({
        status: 'success',
        perfil
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Administrar/Actualizar perfil
   * Cumple con la regla de negocio: "No cambia ID"
   */
  static async actualizarPerfil(req, res, next) {
    try {
      const identificacion = req.user.identificacion;

      // Si intenta cambiar el email, verificar que no esté ocupado por otro usuario
      if (req.body.email) {
        const existente = await UsuarioModel.findByEmail(req.body.email);
        if (existente && existente.identificacion !== identificacion) {
          return res.status(409).json({
            status: 'fail',
            message: `El correo electrónico '${req.body.email}' ya se encuentra en uso por otro usuario`
          });
        }
      }

      const usuarioActualizado = await UsuarioModel.updatePerfil(identificacion, req.body);

      if (!usuarioActualizado) {
        return res.status(404).json({
          status: 'fail',
          message: 'No fue posible actualizar el perfil del usuario'
        });
      }

      const { password, ...perfilActualizado } = usuarioActualizado;

      res.status(200).json({
        status: 'success',
        message: 'Perfil de usuario actualizado exitosamente (Identificación conservada intacta)',
        perfil: perfilActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ver historial de préstamos propios del usuario autenticado
   */
  static async verHistorialPrestamos(req, res, next) {
    try {
      const identificacion = req.user.identificacion;
      const prestamos = await PrestamoModel.findByUsuarioIdentificacion(identificacion);

      res.status(200).json({
        status: 'success',
        total: prestamos.length,
        usuario: {
          identificacion,
          nombre: req.user.nombre
        },
        prestamos
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ver historial de compras (ventas) propias del cliente autenticado
   */
  static async verHistorialCompras(req, res, next) {
    try {
      const identificacion = req.user.identificacion;
      const compras = await VentaModel.findByClienteIdentificacion(identificacion);

      res.status(200).json({
        status: 'success',
        total: compras.length,
        cliente: {
          identificacion,
          nombre: req.user.nombre
        },
        compras
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los usuarios/clientes (Solo Admin)
   */
  static async listarTodos(req, res, next) {
    try {
      const usuarios = await UsuarioModel.findAll();
      res.status(200).json({
        status: 'success',
        total: usuarios.length,
        usuarios
      });
    } catch (error) {
      next(error);
    }
  }
}
