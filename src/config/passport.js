import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { getDB } from './db.js';

dotenv.config();

// Módulo 5: Autenticación con JWT mediante PassportJS
// Extrae el token de las Cookies (Módulo 3) o del encabezado Bearer
const extractor = (req) => {
  if (req && req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

const opciones = {
  jwtFromRequest: extractor,
  secretOrKey: process.env.JWT_SECRET || 'campuslands_secreto_2026'
};

passport.use(
  new JwtStrategy(opciones, async (payload, done) => {
    try {
      const db = getDB();
      const usuario = await db.collection('usuarios').findOne({ identificacion: payload.identificacion });
      if (!usuario) {
        return done(null, false);
      }
      return done(null, usuario);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
