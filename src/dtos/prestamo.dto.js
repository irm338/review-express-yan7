/**
 * DTO para Registrar Préstamo de Libro (Admin)
 */
export const createPrestamoDTO = {
  libroId: {
    required: true,
    type: 'string',
    message: 'El ID o código del libro a prestar es obligatorio'
  },
  usuarioIdentificacion: {
    required: true,
    type: 'string',
    message: 'La identificación del usuario solicitante es obligatoria'
  },
  fechaPrestamo: {
    required: false,
    type: 'date',
    default: () => new Date()
  },
  fechaTentativaDevol: {
    required: true,
    type: 'date',
    message: 'La fecha tentativa de devolución es obligatoria'
  },
  observaciones: {
    required: false,
    type: 'string'
  }
};

/**
 * DTO para Registrar Devolución de Libro (Admin)
 */
export const devolucionDTO = {
  fechaDevol: {
    required: false,
    type: 'date',
    default: () => new Date()
  },
  observaciones: {
    required: false,
    type: 'string'
  }
};
