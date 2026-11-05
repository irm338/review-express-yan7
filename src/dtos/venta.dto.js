/**
 * DTO para Registrar Venta de Libros (Admin)
 */
export const createVentaDTO = {
  clienteIdentificacion: {
    required: true,
    type: 'string',
    message: 'La identificación del cliente es obligatoria'
  },
  libros: {
    required: true,
    type: 'array',
    custom: (val) => {
      if (!Array.isArray(val) || val.length === 0) {
        return 'Debe incluir al menos un libro en la venta';
      }
      for (const item of val) {
        if (!item.libroId) {
          return 'Cada elemento debe incluir libroId';
        }
        if (!item.cantidad || isNaN(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
          return 'La cantidad de cada libro debe ser un número entero mayor a 0';
        }
      }
      return true;
    },
    message: 'Debe incluir la lista de libros a vender'
  },
  fecha: {
    required: false,
    type: 'date',
    default: () => new Date()
  },
  metodoPago: {
    required: false,
    type: 'string',
    enum: ['efectivo', 'tarjeta', 'transferencia'],
    default: 'efectivo'
  }
};
