import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  dbName: process.env.MONGO_DB_NAME || 'biblioteca_campus',
  jwtSecret: process.env.JWT_SECRET || 'campuslands_super_secreto_review_jwt_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  cookieSecret: process.env.COOKIE_SECRET || 'campuslands_cookie_secret_key_2026',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
};
