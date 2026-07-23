// Vista de categorías

async function loadCategorias() {
  try {
    const categorias = await api.getCategorias();
    const tbody = document.getElementById('tabla-categorias');
    tbody.innerHTML = categorias.map(c => `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.descripcion || '—'}</td>
        <td class="num mono">${c.total_productos}</td>
        <td class="actions-cell">
          <button class="btn btn-sm btn-danger-text" onclick="borrarCategoria(${c.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Error al cargar categorías: ' + err.message, true);
  }
}

async function borrarCategoria(id) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  try {
    await api.eliminarCategoria(id);
    showToast('Categoría eliminada correctamente');
    loadCategorias();
    poblarSelectsCategoriaProveedor();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, true);
  }
}

document.getElementById('btn-nueva-categoria').addEventListener('click', () => {
  document.getElementById('c-nombre').value = '';
  document.getElementById('c-descripcion').value = '';
  openModal('modal-categoria');
});

document.getElementById('btn-guardar-categoria').addEventListener('click', async () => {
  const nombre = document.getElementById('c-nombre').value.trim();
  const descripcion = document.getElementById('c-descripcion').value.trim();
  if (!nombre) { showToast('El nombre es obligatorio', true); return; }

  try {
    await api.crearCategoria({ nombre, descripcion });
    showToast('Categoría creada correctamente');
    closeModal('modal-categoria');
    loadCategorias();
    poblarSelectsCategoriaProveedor();
  } catch (err) {
    showToast('Error al guardar: ' + err.message, true);
  }
});
