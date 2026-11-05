import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import semver from 'semver';
import { validarPerfilDTO, validarRegistroDTO } from '../src/middlewares/dto.middleware.js';

test('Módulo 4: Versionado SemVer', () => {
  assert.equal(semver.valid('1.0.0'), '1.0.0');
  assert.ok(semver.satisfies('1.0.0', '^1.0.0'));
});

test('Módulo 3: DTO - Bloquea cambio de identificación (No cambia ID)', () => {
  const req = {
    body: {
      identificacion: '9999',
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

  validarPerfilDTO(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.ok(responseData.error.includes('No cambia ID'));
});

test('Módulo 3: DTO - Valida campos requeridos en el registro', () => {
  const req = {
    body: {
      nombre: 'Irma'
    }
  };

  let statusCode = null;
  const res = {
    status(code) {
      statusCode = code;
      return {
        json() {}
      };
    }
  };

  let nextCalled = false;
  const next = () => { nextCalled = true; };

  validarRegistroDTO(req, res, next);

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
});

test('Módulo 5: Hashing de contraseñas con bcryptjs', async () => {
  const pass = 'Password123*';
  const hash = await bcrypt.hash(pass, 10);
  assert.ok(await bcrypt.compare(pass, hash));
});
