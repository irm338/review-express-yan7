import semver from 'semver';

// Módulo 4: Versionado Semántico (SemVer)
export const semverMiddleware = (req, res, next) => {
  const version = req.headers['accept-version'] || '1.0.0';

  if (!semver.valid(version)) {
    return res.status(400).json({ error: 'Versión semántica no válida (Ejemplo esperado: 1.0.0)' });
  }

  // Se añade la versión a las cabeceras de respuesta
  res.setHeader('API-Version', '1.0.0');
  next();
};
