import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './env.js';
import { UsuarioModel } from '../models/usuario.model.js';
import { COOKIE_NAME } from '../utils/cookies.js';

// Extractor personalizado para obtener el token desde cookies o headers
const cookieOrHeaderExtractor = (req) => {
  let token = null;

  // 1. Intentar extraer de cookies firmadas o normales
  if (req && req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  } else if (req && req.signedCookies && req.signedCookies[COOKIE_NAME]) {
    token = req.signedCookies[COOKIE_NAME];
  }

  // 2. Si no hay cookie, extraer de cabecera Authorization: Bearer <token>
  if (!token && req && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  return token;
};

const jwtOptions = {
  jwtFromRequest: cookieOrHeaderExtractor,
  secretOrKey: config.jwtSecret
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      // Buscar usuario en base de datos usando el ID o la Identificación del payload
      const user = await UsuarioModel.findByIdentificacion(jwtPayload.identificacion);

      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado o token inválido' });
      }

      // Descartar la contraseña del objeto usuario inyectado en req.user
      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
