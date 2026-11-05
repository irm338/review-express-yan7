import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import semver from 'semver';
import { validateDTO } from '../src/middlewares/dto.middleware.js';
import { updatePerfilDTO } from '../src/dtos/usuario.dto.js';
import { registerDTO } from '../src/dtos/auth.dto.js';
import { CURRENT_API_VERSION } from '../src/middlewares/version.middleware.js';

test('Módulo 1 & 4: Semver versioning specification', () => {
  assert.equal(semver.valid(CURRENT_API_VERSION), '1.0.0');
  assert.ok(semver.satisfies('1.0.0', '^1.0.0'));
  assert.ok(!semver.satisfies('2.0.0', '^1.0.0'));
});

test('Módulo 3: Validación DTO - Rechaza modificación de ID inmutable', () => {
  const req = {
    body: {
      identificacion: '9999', // Campo prohibido en perfil
      nombre: 'Nuevo Nombre'
    }
  };

  let statusCode = null;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return {
        json(data) {
          responseData = data;
        }
      };
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const middleware = validateDTO(updatePerfilDTO);
  middleware(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.equal(responseData.status, 'fail');
  assert.ok(responseData.errors.some(e => e.field === 'identificacion'));
});

test('Módulo 3: Validación DTO - Valida campos requeridos en registro', () => {
  const req = {
    body: {
      // Falta identificacion, email, password
      nombre: 'Irma'
    }
  };

  let statusCode = null;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return {
        json(data) {
          responseData = data;
        }
      };
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  const middleware = validateDTO(registerDTO);
  middleware(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.ok(responseData.errors.length >= 3);
});

test('Módulo 5: Hashing y verificación de contraseñas con bcryptjs', async () => {
  const password = 'MiPasswordSeguro123*';
  const hashed = await bcrypt.hash(password, 10);

  assert.notEqual(password, hashed);
  assert.ok(await bcrypt.compare(password, hashed));
  assert.ok(!(await bcrypt.compare('PasswordErroneo', hashed)));
});
