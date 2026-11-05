/**
 * DTO para Actualización de Perfil de Usuario / Cliente
 * Regla de negocio crítica: "No cambia ID" (La identificación es inmutable)
 */
export const updatePerfilDTO = {
  nombre: {
    required: false,
    type: 'string',
    regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,80}$/,
    regexMessage: 'El nombre debe contener solo letras y espacios (mínimo 3 caracteres)'
  },
  tel: {
    required: false,
    type: 'string',
    regex: /^[0-9+()\-.\s]{7,15}$/,
    regexMessage: 'El teléfono debe ser un formato válido (7 a 15 dígitos)'
  },
  dir: {
    required: false,
    type: 'string'
  },
  email: {
    required: false,
    type: 'string',
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    regexMessage: 'El email debe tener un formato válido (ej. usuario@dominio.com)'
  },
  password: {
    required: false,
    type: 'string',
    custom: (val) => val.length >= 6 || 'La nueva contraseña debe tener mínimo 6 caracteres'
  },
  // Lista explícita de campos prohibidos para proteger la inmutabilidad
  _forbiddenFields: ['identificacion', 'id', '_id', 'rol', 'createdAt']
};
