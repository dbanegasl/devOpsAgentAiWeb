/**
 * Cliente HTTP para el API de jsonplaceholder.
 * @module api
 */

import { validateUser } from './validator.js';

/** Base URL del API público. */
export const API_BASE = 'https://jsonplaceholder.typicode.com';

/**
 * Parsea una respuesta `fetch` como JSON, controlando errores de red,
 * status HTTP y JSON malformado.
 *
 * @param {Response} response Respuesta de `fetch`.
 * @returns {Promise<any>} Cuerpo parseado.
 * @throws {Error} Si el status no es 2xx o el JSON es inválido.
 */
async function parseJsonResponse(response) {
  if (!response.ok) {
    throw new Error(
      `Server responded with status ${response.status} ${response.statusText || ''}`.trim()
    );
  }
  let text;
  try {
    text = await response.text();
  } catch (err) {
    throw new Error(`Failed to read response body: ${err.message}`);
  }
  if (!text || !text.trim()) {
    throw new Error('Empty response body');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Malformed JSON response: ${err.message}`);
  }
}

/**
 * Obtiene la lista de usuarios y valida cada uno con `validateUser`.
 * Si TODOS los elementos son inválidos lanza un error; si algunos son válidos
 * devuelve solo los válidos (el comportamiento inválido es logueado en consola).
 *
 * @returns {Promise<object[]>} Lista de usuarios válidos.
 * @throws {Error} Si la red falla, el servidor responde con error, el JSON es
 *   inválido, la respuesta no es un array o ningún usuario es válido.
 */
export async function fetchUsers() {
  let response;
  try {
    response = await fetch(`${API_BASE}/users`);
  } catch (err) {
    throw new Error(`Network error while fetching users: ${err.message}`);
  }

  const data = await parseJsonResponse(response);

  if (!Array.isArray(data)) {
    throw new Error('Invalid response: expected an array of users');
  }

  const valid = [];
  const invalid = [];
  for (const user of data) {
    const result = validateUser(user);
    if (result.valid) {
      valid.push(user);
    } else {
      invalid.push({ user, errors: result.errors });
    }
  }

  if (valid.length === 0) {
    const detail = invalid.map((i) => i.errors.join('; ')).join(' | ');
    throw new Error(`All users failed validation: ${detail}`);
  }

  if (invalid.length > 0 && typeof console !== 'undefined') {
    console.warn(
      `[api] Skipped ${invalid.length} invalid user(s):`,
      invalid.map((i) => i.errors)
    );
  }

  return valid;
}

/**
 * Obtiene un usuario por ID y valida el resultado.
 *
 * @param {number|string} id Identificador del usuario.
 * @returns {Promise<object>} Usuario válido.
 * @throws {Error} Si la red falla, el servidor responde con error, el JSON es
 *   inválido o el usuario no pasa la validación.
 */
export async function fetchUserById(id) {
  if (id === undefined || id === null || id === '') {
    throw new Error('fetchUserById: id is required');
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`);
  } catch (err) {
    throw new Error(`Network error while fetching user ${id}: ${err.message}`);
  }

  const data = await parseJsonResponse(response);
  const result = validateUser(data);
  if (!result.valid) {
    throw new Error(`Invalid user data: ${result.errors.join('; ')}`);
  }
  return data;
}
