import { VentaModel } from '../models/venta.model.js';
import { LibroModel } from '../models/libro.model.js';
import { UsuarioModel } from '../models/usuario.model.js';

export class VentaController {
  /**
   * Registrar una nueva venta de libros (Solo Admin)
   * Permite vender 1 o varios libros, valida stock suficiente de cada uno y actualiza el inventario
   */
  static async registrarVenta(req, res, next) {
    try {
      const { clienteIdentificacion, libros: itemsSolicitados, fecha, metodoPago } = req.body;

      // 1. Validar que el cliente exista
      const cliente = await UsuarioModel.findByIdentificacion(clienteIdentificacion);
      if (!cliente) {
        return res.status(404).json({
          status: 'fail',
          message: `Cliente con identificación '${clienteIdentificacion}' no encontrado en el sistema`
        });
      }

      // 2. Validar cada libro y verificar disponibilidad de stock suficiente
      const librosValidados = [];
      let totalVenta = 0;

      for (const item of itemsSolicitados) {
        const libro = await LibroModel.findById(item.libroId);

        if (!libro) {
          return res.status(404).json({
            status: 'fail',
            message: `Libro con ID '${item.libroId}' no encontrado`
          });
        }

        const cantidad = Number(item.cantidad);

        if (libro.cantidadDisponible < cantidad) {
          return res.status(400).json({
            status: 'fail',
            message: `Stock insuficiente para '${libro.titulo}'. Solicitados: ${cantidad}, Disponibles: ${libro.cantidadDisponible}`
          });
        }

        const precioUnitario = Number(libro.precioVenta);
        const subtotal = precioUnitario * cantidad;
        totalVenta += subtotal;

        librosValidados.push({
          libroId: libro._id,
          isbn: libro.isbn,
          titulo: libro.titulo,
          cantidad,
          precioUnitario,
          subtotal
        });
      }

      // 3. Descontar stock de cada libro en el inventario
      const librosActualizados = [];
      for (const item of librosValidados) {
        const libroActualizado = await LibroModel.updateStock(item.libroId, -item.cantidad);
        librosActualizados.push({
          libroId: item.libroId,
          titulo: item.titulo,
          stockRestante: libroActualizado.cantidadDisponible
        });
      }

      // 4. Crear el registro de venta
      const venta = await VentaModel.create({
        cliente: {
          identificacion: cliente.identificacion,
          nombre: cliente.nombre,
          email: cliente.email,
          tel: cliente.tel,
          dir: cliente.dir
        },
        libros: librosValidados,
        total: totalVenta,
        fecha: fecha || new Date(),
        metodoPago: metodoPago || 'efectivo'
      });

      res.status(201).json({
        status: 'success',
        message: 'Venta registrada exitosamente y stock de libros actualizado',
        venta,
        inventarioActualizado: librosActualizados
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todas las ventas (Solo Admin)
   */
  static async listarTodas(req, res, next) {
    try {
      const resultado = await VentaModel.findAll(req.query);
      res.status(200).json({
        status: 'success',
        ...resultado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener detalle de una venta por ID
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const venta = await VentaModel.findById(id);

      if (!venta) {
        return res.status(404).json({
          status: 'fail',
          message: `Venta con ID '${id}' no encontrada`
        });
      }

      // Si no es admin y la venta no es de su propiedad, denegar
      if (req.user.rol !== 'admin' && req.user.identificacion !== venta.cliente.identificacion) {
        return res.status(403).json({
          status: 'fail',
          message: 'No tiene permisos para ver esta venta'
        });
      }

      res.status(200).json({
        status: 'success',
        venta
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar compras/ventas de un cliente específico por su identificación (Admin)
   */
  static async listarPorCliente(req, res, next) {
    try {
      const { identificacion } = req.params;
      const ventas = await VentaModel.findByClienteIdentificacion(identificacion);

      res.status(200).json({
        status: 'success',
        total: ventas.length,
        identificacion,
        ventas
      });
    } catch (error) {
      next(error);
    }
  }
}
