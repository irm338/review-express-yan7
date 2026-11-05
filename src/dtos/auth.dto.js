/**
 * DTO para Registro de Usuario / Cliente
 */
export const registerDTO = {
  identificacion: {
    required: true,
    type: 'string',
    regex: /^[A-Za-z0-9\-_]{4,20}$/,
    regexMessage: 'La identificación debe tener entre 4 y 20 caracteres alfanuméricos',
    message: 'La identificación es obligatoria'
  },
  nombre: {
    required: true,
    type: 'string',
    regex: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{3,80}$/,
    regexMessage: 'El nombre debe contener solo letras y espacios (mínimo 3 caracteres)',
    message: 'El nombre es obligatorio'
  },
  tel: {
    required: true,
    type: 'string',
    regex: /^[0-9+()\-.\s]{7,15}$/,
    regexMessage: 'El teléfono debe ser un formato válido (7 a 15 dígitos)',
    message: 'El teléfono es obligatorio'
  },
  dir: {
    required: true,
    type: 'string',
    message: 'La dirección es obligatoria'
  },
  email: {
    required: true,
    type: 'string',
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    regexMessage: 'El email debe tener un formato válido (ej. usuario@dominio.com)',
    message: 'El correo electrónico es obligatorio'
  },
  password: {
    required: true,
    type: 'string',
    custom: (val) => val.length >= 6 || 'La contraseña debe tener mínimo 6 caracteres',
    message: 'La contraseña es obligatoria'
  },
  rol: {
    required: false,
    type: 'string',
    enum: ['usuario', 'admin'],
    default: 'usuario'
  }
};

/**
 * DTO para Inicio de Sesión (Login)
 */
export const loginDTO = {
  identificacion: {
    required: false,
    type: 'string'
  },
  email: {
    required: false,
    type: 'string'
  },
  password: {
    required: true,
    type: 'string',
    message: 'La contraseña es obligatoria'
  },
  // Validación personalizada: debe enviar al menos email o identificación
  _loginValidation: {
    custom: (_, data) => {
      if (!data.email && !data.identificacion) {
        return 'Debe proporcionar su email o identificación para iniciar sesión';
      }
      return true;
    }
  }
};
