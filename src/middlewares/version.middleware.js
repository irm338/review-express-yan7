import semver from 'semver';

export const CURRENT_API_VERSION = '1.0.0';

/**
 * Middleware para validar y manejar Versionado Semántico (SemVer)
 * Soporta versiones pasadas por:
 * 1. Cabecera 'Accept-Version' o 'x-api-version'
 * 2. Query param ?version=1.0.0
 * 3. Prefijo de URL (/api/v1/...)
 */
export const semverMiddleware = (supportedVersion = CURRENT_API_VERSION) => {
  return (req, res, next) => {
    // 1. Extraer la versión solicitada por el cliente
    const requestedVersion =
      req.headers['accept-version'] ||
      req.headers['x-api-version'] ||
      req.query.version ||
      '1.0.0';

    // Limpiar o normalizar formato semver (ej: "1" o "1.0" -> "1.0.0")
    const coercedVersion = semver.coerce(requestedVersion)?.version;

    if (!coercedVersion || !semver.valid(coercedVersion)) {
      return res.status(400).json({
        status: 'fail',
        message: `Versión de API inválida: '${requestedVersion}'. Debe seguir la especificación SemVer (ej. 1.0.0).`
      });
    }

    // 2. Comprobar compatibilidad con la versión soportada (mismo número mayor)
    const isCompatible = semver.satisfies(coercedVersion, `^${semver.major(supportedVersion)}.0.0`);

    if (!isCompatible) {
      return res.status(400).json({
        status: 'fail',
        message: `La versión de API solicitada (${coercedVersion}) no es compatible con el servidor (${supportedVersion}).`,
        currentSupportedVersion: supportedVersion
      });
    }

    // Inyectar versión en el request y cabeceras de respuesta
    req.apiVersion = coercedVersion;
    res.setHeader('API-Version', supportedVersion);
    res.setHeader('X-Semver-Client', coercedVersion);

    next();
  };
};
