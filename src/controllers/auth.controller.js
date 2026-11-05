import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';

// ============================================================================
// Módulo 5 (Passport JWT) & Módulo 3 (Cookies en NodeJS)
// ============================================================================

// 1. Registro de Usuario / Cliente
export const registrar = async (req, res) => {
  try {
    const { identificacion, nombre, tel, dir, email, password, rol } = req.body;
    const db = getDB();

    // Paso 1: Verificar si ya existe un usuario con esa identificación o email
    const usuarioExistente = await db.collection('usuarios').findOne({
      $or: [{ identificacion }, { email }]
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'La identificación o el correo ya se encuentran registrados' });
    }

    // Paso 2: Hashear la contraseña con bcrypt (10 rondas de salt)
    const passwordHasheada = await bcrypt.hash(password, 10);

    // Paso 3: Guardar el nuevo usuario en MongoDB
    const nuevoUsuario = {
      identificacion,
      nombre,
      tel,
      dir,
      email,
      password: passwordHasheada,
      rol: rol || 'usuario', // Rol por defecto 'usuario'
      createdAt: new Date()
    };

    await db.collection('usuarios').insertOne(nuevoUsuario);

    // Paso 4: Generar el token JWT
    const token = jwt.sign(
      { identificacion: nuevoUsuario.identificacion, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET || 'campuslands_secreto_2026',
      { expiresIn: '24h' }
    );

    // Paso 5: Almacenar el token en una Cookie segura HttpOnly (Módulo 3)
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        identificacion: nuevoUsuario.identificacion,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Inicio de Sesión (Login)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // Paso 1: Buscar al usuario por su email
    const usuario = await db.collection('usuarios').findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas: correo no registrado' });
    }

    // Paso 2: Comparar la contraseña ingresada con la contraseña encriptada
    const contraseniaCorrecta = await bcrypt.compare(password, usuario.password);
    if (!contraseniaCorrecta) {
      return res.status(401).json({ error: 'Credenciales inválidas: contraseña incorrecta' });
    }

    // Paso 3: Generar el token JWT
    const token = jwt.sign(
      { identificacion: usuario.identificacion, rol: usuario.rol },
      process.env.JWT_SECRET || 'campuslands_secreto_2026',
      { expiresIn: '24h' }
    );

    // Paso 4: Guardar en Cookie segura HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        identificacion: usuario.identificacion,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Cerrar Sesión (Logout)
export const logout = (req, res) => {
  // Limpiar la cookie 'token'
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión finalizada y cookie eliminada' });
};
