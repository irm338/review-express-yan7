import semver from 'semver';

// Módulo 4: Versionado Semántico (SemVer)
export const semverMiddleware = (req, res, next) => {
  // El cliente puede enviar la cabecera "Accept-Version" con la versión que desea consumir
  const versionCliente = req.headers['accept-version'] || '1.0.0';

  // Validar si cumple con el estándar semver (ejemplo: 1.0.0)
  if (!semver.valid(versionCliente)) {
    return res.status(400).json({
      error: 'Formato de versión no válido. Debe ser una versión semántica como 1.0.0'
    });
  }

  // Devolver siempre en las cabeceras la versión activa de la API
  res.setHeader('API-Version', '1.0.0');
  next();
};
