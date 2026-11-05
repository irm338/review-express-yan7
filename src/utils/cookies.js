/**
 * Utilidades para el manejo de cookies HTTP seguras
 */

export const COOKIE_NAME = 'token';

/**
 * Establecer cookie de autenticación JWT
 */
export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // Protege contra ataques XSS
    secure: process.env.NODE_ENV === 'production', // true solo en HTTPS
    sameSite: 'lax', // Protección CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });
};

/**
 * Limpiar la cookie de autenticación (Logout)
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
};
