import { fetchUsers, fetchUserById } from './api.js';

const $ = (sel) => document.querySelector(sel);

const loadBtn = $('#loadUsersBtn');
const tbody = $('#usersTbody');
const errorBox = $('#errorBox');
const modalEl = $('#userModal');
const modalBody = $('#userModalBody');
const modalLabel = $('#userModalLabel');

const userModal = new bootstrap.Modal(modalEl);

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('d-none');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('d-none');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderUsers(users) {
  if (!users.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="skeleton text-center">Sin usuarios.</td></tr>';
    return;
  }
  tbody.innerHTML = users
    .map(
      (u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.address.city)}</td>
        <td class="text-end">
          <button class="icon-btn" data-user-id="${escapeHtml(u.id)}" title="Ver detalle" aria-label="Ver detalle">
            <i class="fa-regular fa-eye"></i>
          </button>
        </td>
      </tr>`
    )
    .join('');
}

function renderUserDetail(user) {
  const { name, email, address } = user;
  const { lat, lng } = address.geo;
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(lng)}`;
  modalLabel.textContent = name;
  modalBody.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Nombre</span>
      <span class="detail-value">${escapeHtml(name)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email</span>
      <span class="detail-value">${escapeHtml(email)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ciudad</span>
      <span class="detail-value">${escapeHtml(address.city)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ubicación</span>
      <span class="detail-value">
        <a class="map-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
          <i class="fa-solid fa-location-dot me-1"></i>${escapeHtml(lat)}, ${escapeHtml(lng)}
        </a>
      </span>
    </div>
  `;
}

async function onLoadUsers() {
  clearError();
  loadBtn.disabled = true;
  const originalHtml = loadBtn.innerHTML;
  loadBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cargando…';
  tbody.innerHTML =
    '<tr><td colspan="4" class="skeleton text-center">Cargando usuarios…</td></tr>';
  try {
    const users = await fetchUsers();
    renderUsers(users);
  } catch (err) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="skeleton text-center">No se pudieron cargar los datos.</td></tr>';
    showError(err.message || 'Error desconocido al cargar usuarios.');
  } finally {
    loadBtn.disabled = false;
    loadBtn.innerHTML = originalHtml;
  }
}

async function onShowDetail(id) {
  clearError();
  modalLabel.textContent = 'Cargando…';
  modalBody.innerHTML = '<div class="skeleton">Cargando detalle del usuario…</div>';
  userModal.show();
  try {
    const user = await fetchUserById(id);
    renderUserDetail(user);
  } catch (err) {
    modalLabel.textContent = 'Error';
    modalBody.innerHTML = `<div class="alert alert-error">${escapeHtml(
      err.message || 'Error desconocido al cargar el detalle.'
    )}</div>`;
  }
}

loadBtn.addEventListener('click', onLoadUsers);

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-user-id]');
  if (!btn) return;
  const id = btn.getAttribute('data-user-id');
  onShowDetail(id);
});
