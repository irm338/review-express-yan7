/**
 * Middleware genérico para validación y saneamiento de DTOs (Data Transfer Objects)
 * @param {Object} schema - Esquema de validación con reglas por campo
 * @param {'body'|'query'|'params'} source - Origen de los datos a validar (por defecto 'body')
 */
export const validateDTO = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = [];
    const sanitized = {};

    // Validar cada regla definida en el esquema
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      // 1. Regla de campo requerido
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: rules.message || `El campo '${field}' es obligatorio`
        });
        continue;
      }

      // Si el campo es opcional y no viene, continuamos
      if (value === undefined || value === null || value === '') {
        if (rules.default !== undefined) {
          sanitized[field] = typeof rules.default === 'function' ? rules.default() : rules.default;
        }
        continue;
      }

      // 2. Regla de tipo de dato
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push({ field, message: `El campo '${field}' debe ser un arreglo (Array)` });
            continue;
          }
        } else if (rules.type === 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push({ field, message: `El campo '${field}' debe ser un número válido` });
            continue;
          }
        } else if (rules.type === 'date') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({ field, message: `El campo '${field}' debe ser una fecha válida (ISO 8601 o YYYY-MM-DD)` });
            continue;
          }
        } else if (typeof value !== rules.type) {
          errors.push({ field, message: `El campo '${field}' debe ser de tipo ${rules.type}` });
          continue;
        }
      }

      // 3. Reglas numéricas (min, max)
      if (rules.type === 'number') {
        const num = Number(value);
        if (rules.min !== undefined && num < rules.min) {
          errors.push({ field, message: `El campo '${field}' no puede ser menor a ${rules.min}` });
          continue;
        }
        if (rules.max !== undefined && num > rules.max) {
          errors.push({ field, message: `El campo '${field}' no puede ser mayor a ${rules.max}` });
          continue;
        }
        sanitized[field] = num;
        continue;
      }

      // 4. Regla de expresión regular (Regex)
      if (rules.regex && !rules.regex.test(String(value))) {
        errors.push({
          field,
          message: rules.regexMessage || `El formato del campo '${field}' es inválido`
        });
        continue;
      }

      // 5. Regla de valores permitidos (Enum)
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field,
          message: `El campo '${field}' debe ser uno de los siguientes valores: ${rules.enum.join(', ')}`
        });
        continue;
      }

      // 6. Validación personalizada (Custom validator)
      if (typeof rules.custom === 'function') {
        const customResult = rules.custom(value, data);
        if (customResult !== true) {
          errors.push({
            field,
            message: typeof customResult === 'string' ? customResult : `Validación fallida en '${field}'`
          });
          continue;
        }
      }

      // 7. Sanitización y asignación limpia
      if (rules.type === 'string') {
        sanitized[field] = String(value).trim();
      } else if (rules.type === 'date') {
        sanitized[field] = new Date(value);
      } else {
        sanitized[field] = value;
      }
    }

    // Verificar si se enviaron campos prohibidos o inmutables (ej. ID en perfil)
    if (schema._forbiddenFields) {
      for (const forbidden of schema._forbiddenFields) {
        if (data[forbidden] !== undefined) {
          errors.push({
            field: forbidden,
            message: `El campo '${forbidden}' es inmutable y no puede ser modificado.`
          });
        }
      }
    }

    // Si existen errores, retornar 400 Bad Request
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Error de validación en los datos enviados (DTO)',
        errors
      });
    }

    // Reemplazar los datos sin procesar por los datos saneados y validados
    req[source] = sanitized;
    next();
  };
};
