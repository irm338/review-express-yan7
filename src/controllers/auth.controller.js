import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/usuario.model.js';
import { config } from '../config/env.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

export class AuthController {
  /**
   * Registro de un nuevo Usuario / Cliente
   */
  static async register(req, res, next) {
    try {
      const { identificacion, nombre, tel, dir, email, password, rol } = req.body;

      // 1. Verificar si ya existe usuario con esa identificación
      const existingId = await UsuarioModel.findByIdentificacion(identificacion);
      if (existingId) {
        return res.status(409).json({
          status: 'fail',
          message: `Ya existe un usuario registrado con la identificación '${identificacion}'`
        });
      }

      // 2. Verificar si ya existe usuario con ese correo electrónico
      const existingEmail = await UsuarioModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({
          status: 'fail',
          message: `Ya existe un usuario registrado con el correo electrónico '${email}'`
        });
      }

      // 3. Crear usuario
      const nuevoUsuario = await UsuarioModel.create({
        identificacion,
        nombre,
        tel,
        dir,
        email,
        password,
        rol: rol || 'usuario'
      });

      // 4. Generar Token JWT
      const payload = {
        id: nuevoUsuario._id,
        identificacion: nuevoUsuario.identificacion,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      };

      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      // 5. Guardar en Cookie segura
      setAuthCookie(res, token);

      // Descartar contraseña de la respuesta
      const { password: _, ...userData } = nuevoUsuario;

      res.status(201).json({
        status: 'success',
        message: 'Usuario registrado exitosamente',
        token,
        usuario: userData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Inicio de Sesión (Login)
   */
  static async login(req, res, next) {
    try {
      const { identificacion, email, password } = req.body;

      // Buscar por email o identificación
      const usuario = email
        ? await UsuarioModel.findByEmail(email)
        : await UsuarioModel.findByIdentificacion(identificacion);

      if (!usuario) {
        return res.status(401).json({
          status: 'fail',
          message: 'Credenciales inválidas. Identificación o correo no encontrado.'
        });
      }

      // Verificar la contraseña con bcrypt
      const passwordMatch = await UsuarioModel.comparePassword(password, usuario.password);
      if (!passwordMatch) {
        return res.status(401).json({
          status: 'fail',
          message: 'Credenciales inválidas. Contraseña incorrecta.'
        });
      }

      // Generar Token JWT
      const payload = {
        id: usuario._id,
        identificacion: usuario.identificacion,
        email: usuario.email,
        rol: usuario.rol
      };

      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

      // Guardar en Cookie segura HttpOnly
      setAuthCookie(res, token);

      const { password: _, ...userData } = usuario;

      res.status(200).json({
        status: 'success',
        message: 'Inicio de sesión exitoso',
        token,
        usuario: userData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cerrar Sesión (Logout)
   */
  static async logout(req, res) {
    clearAuthCookie(res);
    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada correctamente y cookie eliminada'
    });
  }

  /**
   * Obtener datos del usuario autenticado actual
   */
  static async getMe(req, res) {
    res.status(200).json({
      status: 'success',
      usuario: req.user
    });
  }
}
