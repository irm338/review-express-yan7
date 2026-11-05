import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/db.js';

// Módulo 5: Autenticación con JWT y Módulo 3: Cookies en NodeJS

export const registrar = async (req, res) => {
  try {
    const { identificacion, nombre, tel, dir, email, password, rol } = req.body;
    const db = getDB();

    // 1. Verificar si ya existe el usuario
    const existe = await db.collection('usuarios').findOne({
      $or: [{ identificacion }, { email }]
    });

    if (existe) {
      return res.status(400).json({ error: 'La identificación o el correo ya están registrados' });
    }

    // 2. Encriptar contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Crear usuario
    const nuevoUsuario = {
      identificacion,
      nombre,
      tel,
      dir,
      email,
      password: passwordHash,
      rol: rol || 'usuario',
      createdAt: new Date()
    };

    await db.collection('usuarios').insertOne(nuevoUsuario);

    // 4. Generar Token JWT
    const token = jwt.sign(
      { identificacion: nuevoUsuario.identificacion, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET || 'campuslands_secreto_2026',
      { expiresIn: '24h' }
    );

    // 5. Guardar en Cookie segura
    res.cookie('token', token, { httpOnly: true });

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    // 1. Buscar usuario
    const usuario = await db.collection('usuarios').findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // 2. Comparar contraseña con bcrypt
    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { identificacion: usuario.identificacion, rol: usuario.rol },
      process.env.JWT_SECRET || 'campuslands_secreto_2026',
      { expiresIn: '24h' }
    );

    // 4. Guardar en Cookie segura
    res.cookie('token', token, { httpOnly: true });

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

export const logout = (req, res) => {
  // Limpiar la cookie de sesión
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión cerrada y cookie eliminada' });
};
