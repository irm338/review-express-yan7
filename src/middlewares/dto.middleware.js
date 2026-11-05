// ============================================================================
// Módulo 3: Implementación del Objeto de Transferencia de Datos en NodeJS (DTO)
// Validaciones sencillas y claras para garantizar que los datos lleguen bien
// ============================================================================

// 1. DTO para Registrar Usuario / Cliente
export const validarRegistroDTO = (req, res, next) => {
  const { identificacion, nombre, tel, dir, email, password } = req.body;
  if (!identificacion || !nombre || !tel || !dir || !email || !password) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes: identificacion, nombre, tel, dir, email y password son obligatorios'
    });
  }
  next();
};

// 2. DTO para Login
export const validarLoginDTO = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Debe ingresar su correo (email) y contraseña (password)'
    });
  }
  next();
};

// 3. DTO para Libros e Inventario
export const validarLibroDTO = (req, res, next) => {
  const { isbn, titulo, autor, editorial, categoria, anioPublicacion, precioVenta, cantidadDisponible } = req.body;
  if (!isbn || !titulo || !autor || !editorial || !categoria) {
    return res.status(400).json({
      error: 'Datos incompletos del libro: isbn, titulo, autor, editorial y categoria son obligatorios'
    });
  }
  if (precioVenta === undefined || cantidadDisponible === undefined) {
    return res.status(400).json({
      error: 'Debe especificar el precioVenta y la cantidadDisponible (inventario) del libro'
    });
  }
  next();
};

// 4. DTO para Prestar Libro
export const validarPrestamoDTO = (req, res, next) => {
  const { libroId, usuarioIdentificacion, fechaTentativaDevol } = req.body;
  if (!libroId || !usuarioIdentificacion || !fechaTentativaDevol) {
    return res.status(400).json({
      error: 'Debe proporcionar libroId, usuarioIdentificacion y fechaTentativaDevol'
    });
  }
  next();
};

// 5. DTO para Venta de Libros
export const validarVentaDTO = (req, res, next) => {
  const { clienteIdentificacion, libros } = req.body;
  if (!clienteIdentificacion || !Array.isArray(libros) || libros.length === 0) {
    return res.status(400).json({
      error: 'Debe enviar clienteIdentificacion y la lista de libros a comprar (arreglo no vacío)'
    });
  }
  next();
};

// 6. DTO para Actualizar Perfil de Usuario
// REGLA CRÍTICA EXIGIDA: "No cambia ID"
export const validarPerfilDTO = (req, res, next) => {
  if (req.body.identificacion || req.body._id) {
    return res.status(400).json({
      error: 'Regla de negocio: La identificación es inmutable y no se puede modificar (No cambia ID)'
    });
  }
  next();
};
