import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { getDB } from './db.js';

dotenv.config();

// Módulo 5: Autenticación con JWT mediante PassportJS
// Función que extrae el token de las Cookies (Módulo 3) o del encabezado "Authorization: Bearer <token>"
const extraerToken = (req) => {
  // 1. Intentar leer de las cookies del navegador
  if (req && req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  // 2. Si no hay cookie, leer del encabezado Authorization
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

const opciones = {
  jwtFromRequest: extraerToken,
  secretOrKey: process.env.JWT_SECRET || 'campuslands_secreto_2026'
};

passport.use(
  new JwtStrategy(opciones, async (jwtPayload, done) => {
    try {
      const db = getDB();
      // Buscar el usuario en la colección "usuarios" usando la identificación del token
      const usuario = await db.collection('usuarios').findOne({
        identificacion: jwtPayload.identificacion
      });

      if (!usuario) {
        return done(null, false); // Usuario no encontrado
      }

      // Si existe, inyectar el usuario en la petición (req.user)
      return done(null, usuario);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
