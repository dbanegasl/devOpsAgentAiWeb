/**
 * Valida la estructura de un usuario devuelto por jsonplaceholder.
 * @module validator
 */

/** Regex razonable para validar email (no RFC completo, suficiente para UI). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Determina si un valor es una cadena no vacía (tras hacer trim).
 * @param {*} v valor a comprobar.
 * @returns {boolean} `true` si es string con contenido.
 */
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Valida que un objeto usuario tenga los campos mínimos requeridos:
 * `name`, `email` válido, `address.city` y `address.geo.{lat,lng}`.
 *
 * @param {object|null|undefined} user Objeto usuario a validar.
 * @returns {{ valid: boolean, errors: string[] }} Resultado con la lista de errores.
 */
function validateUser(user) {
  const errors = [];

  if (user === null || user === undefined) {
    return { valid: false, errors: ['user is null or undefined'] };
  }
  if (typeof user !== 'object' || Array.isArray(user)) {
    return { valid: false, errors: ['user must be a plain object'] };
  }

  if (!isNonEmptyString(user.name)) {
    errors.push('name is required and must be a non-empty string');
  }

  if (!isNonEmptyString(user.email)) {
    errors.push('email is required and must be a non-empty string');
  } else if (!EMAIL_RE.test(user.email)) {
    errors.push('email format is invalid');
  }

  const address = user.address;
  if (!address || typeof address !== 'object') {
    errors.push('address is required');
  } else {
    if (!isNonEmptyString(address.city)) {
      errors.push('address.city is required and must be a non-empty string');
    }
    const geo = address.geo;
    if (!geo || typeof geo !== 'object') {
      errors.push('address.geo is required');
    } else {
      if (geo.lat === undefined || geo.lat === null || geo.lat === '') {
        errors.push('address.geo.lat is required');
      }
      if (geo.lng === undefined || geo.lng === null || geo.lng === '') {
        errors.push('address.geo.lng is required');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export { validateUser };
export default validateUser;
