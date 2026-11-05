/**
 * DTO para Crear un Libro
 */
export const createLibroDTO = {
  isbn: {
    required: true,
    type: 'string',
    regex: /^[0-9\-]{10,17}$/,
    regexMessage: 'El ISBN debe tener un formato válido (entre 10 y 17 caracteres numéricos con guiones)',
    message: 'El ISBN es obligatorio'
  },
  titulo: {
    required: true,
    type: 'string',
    message: 'El título del libro es obligatorio'
  },
  autor: {
    required: true,
    type: 'string',
    message: 'El autor del libro es obligatorio'
  },
  editorial: {
    required: true,
    type: 'string',
    message: 'La editorial es obligatoria'
  },
  categoria: {
    required: true,
    type: 'string',
    message: 'La categoría o género es obligatoria'
  },
  anioPublicacion: {
    required: true,
    type: 'number',
    min: 1000,
    max: new Date().getFullYear() + 1,
    message: 'El año de publicación debe ser un año válido'
  },
  precioVenta: {
    required: true,
    type: 'number',
    min: 0,
    message: 'El precio de venta debe ser un número mayor o igual a 0'
  },
  cantidadDisponible: {
    required: true,
    type: 'number',
    min: 0,
    message: 'La cantidad disponible (stock) debe ser mayor o igual a 0'
  }
};

/**
 * DTO para Actualizar un Libro
 */
export const updateLibroDTO = {
  titulo: {
    required: false,
    type: 'string'
  },
  autor: {
    required: false,
    type: 'string'
  },
  editorial: {
    required: false,
    type: 'string'
  },
  categoria: {
    required: false,
    type: 'string'
  },
  anioPublicacion: {
    required: false,
    type: 'number',
    min: 1000,
    max: new Date().getFullYear() + 1
  },
  precioVenta: {
    required: false,
    type: 'number',
    min: 0
  },
  cantidadDisponible: {
    required: false,
    type: 'number',
    min: 0
  }
};
