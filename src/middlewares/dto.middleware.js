// Módulo 3: Implementación del Objeto de Transferencia de Datos en NodeJS (DTO)
// Validaciones sencillas y directas para cada requerimiento

// DTO para Registro de Usuario / Cliente
export const validarRegistroDTO = (req, res, next) => {
  const { identificacion, nombre, tel, dir, email, password } = req.body;
  if (!identificacion || !nombre || !tel || !dir || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: identificacion, nombre, tel, dir, email y password son requeridos' });
  }
  next();
};

// DTO para Login
export const validarLoginDTO = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Debe ingresar email y password' });
  }
  next();
};

// DTO para Libros e Inventario
export const validarLibroDTO = (req, res, next) => {
  const { isbn, titulo, autor, editorial, categoria, anioPublicacion, precioVenta, cantidadDisponible } = req.body;
  if (!isbn || !titulo || !autor || !editorial || !categoria) {
    return res.status(400).json({ error: 'Datos incompletos: isbn, titulo, autor, editorial y categoria son requeridos' });
  }
  if (precioVenta === undefined || cantidadDisponible === undefined) {
    return res.status(400).json({ error: 'Debe indicar precioVenta y cantidadDisponible (inventario)' });
  }
  next();
};

// DTO para Prestar Libros
export const validarPrestamoDTO = (req, res, next) => {
  const { libroId, usuarioIdentificacion, fechaTentativaDevol } = req.body;
  if (!libroId || !usuarioIdentificacion || !fechaTentativaDevol) {
    return res.status(400).json({ error: 'Debe ingresar libroId, usuarioIdentificacion y fechaTentativaDevol' });
  }
  next();
};

// DTO para Venta de Libros
export const validarVentaDTO = (req, res, next) => {
  const { clienteIdentificacion, libros } = req.body;
  if (!clienteIdentificacion || !Array.isArray(libros) || libros.length === 0) {
    return res.status(400).json({ error: 'Debe indicar clienteIdentificacion y un arreglo con al menos un libro a comprar' });
  }
  next();
};

// DTO para Perfil de Usuario
// REGLA CRÍTICA DE CLASE: "No cambia ID"
export const validarPerfilDTO = (req, res, next) => {
  if (req.body.identificacion || req.body._id) {
    return res.status(400).json({ error: 'Regla de negocio: No se puede modificar la identificación del usuario (No cambia ID)' });
  }
  next();
};
