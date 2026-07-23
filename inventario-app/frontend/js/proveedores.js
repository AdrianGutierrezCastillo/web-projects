// Vista de proveedores

async function loadProveedores() {
  try {
    const proveedores = await api.getProveedores();
    const tbody = document.getElementById('tabla-proveedores');
    tbody.innerHTML = proveedores.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.contacto || '—'}</td>
        <td>${p.telefono || '—'}</td>
        <td>${p.email || '—'}</td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-danger-text" onclick="borrarProveedor(${p.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Error al cargar proveedores: ' + err.message, true);
  }
}

async function borrarProveedor(id) {
  if (!confirm('¿Eliminar este proveedor?')) return;
  try {
    await api.eliminarProveedor(id);
    showToast('Proveedor eliminado correctamente');
    loadProveedores();
    poblarSelectsCategoriaProveedor();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, true);
  }
}

document.getElementById('btn-nuevo-proveedor').addEventListener('click', () => {
  ['pr-nombre','pr-contacto','pr-telefono','pr-email','pr-direccion'].forEach(id => document.getElementById(id).value = '');
  openModal('modal-proveedor');
});

document.getElementById('btn-guardar-proveedor').addEventListener('click', async () => {
  const nombre = document.getElementById('pr-nombre').value.trim();
  if (!nombre) { showToast('El nombre es obligatorio', true); return; }

  const payload = {
    nombre,
    contacto: document.getElementById('pr-contacto').value.trim(),
    telefono: document.getElementById('pr-telefono').value.trim(),
    email: document.getElementById('pr-email').value.trim(),
    direccion: document.getElementById('pr-direccion').value.trim()
  };

  try {
    await api.crearProveedor(payload);
    showToast('Proveedor creado correctamente');
    closeModal('modal-proveedor');
    loadProveedores();
    poblarSelectsCategoriaProveedor();
  } catch (err) {
    showToast('Error al guardar: ' + err.message, true);
  }
});
