// Vista de movimientos: historial y registro de entradas/salidas/ajustes

async function loadMovimientos() {
  try {
    const movimientos = await api.getMovimientos({ limit: 100 });
    renderTablaMovimientos(movimientos);
  } catch (err) {
    showToast('Error al cargar movimientos: ' + err.message, true);
  }
}

function renderTablaMovimientos(movimientos) {
  const tbody = document.getElementById('tabla-movimientos');
  const empty = document.getElementById('movimientos-empty');

  if (!movimientos.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const tipoBadge = { entrada: 'badge-ok', salida: 'badge-danger', ajuste: 'badge-neutral' };
  const tipoLabel = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' };

  tbody.innerHTML = movimientos.map(m => `
    <tr>
      <td>${formatDate(m.fecha)}</td>
      <td>${m.producto_nombre} <span class="mono" style="color:var(--text-secondary)">(${m.producto_codigo})</span></td>
      <td><span class="badge ${tipoBadge[m.tipo]}">${tipoLabel[m.tipo]}</span></td>
      <td class="num mono">${formatNumber(m.cantidad)}</td>
      <td class="num mono">${formatNumber(m.stock_anterior)} → ${formatNumber(m.stock_nuevo)}</td>
      <td>${m.motivo || '—'}</td>
    </tr>
  `).join('');
}

document.getElementById('btn-nuevo-movimiento').addEventListener('click', async () => {
  try {
    const productos = await api.getProductos();
    const sel = document.getElementById('m-producto');
    sel.innerHTML = productos.map(p => `<option value="${p.id}">${p.codigo} — ${p.nombre} (stock: ${formatNumber(p.stock_actual)})</option>`).join('');
    document.getElementById('m-cantidad').value = '';
    document.getElementById('m-motivo').value = '';
    document.getElementById('m-responsable').value = '';
    openModal('modal-movimiento');
  } catch (err) {
    showToast('Error al cargar productos: ' + err.message, true);
  }
});

document.getElementById('btn-guardar-movimiento').addEventListener('click', async () => {
  const payload = {
    producto_id: Number(document.getElementById('m-producto').value),
    tipo: document.getElementById('m-tipo').value,
    cantidad: Number(document.getElementById('m-cantidad').value),
    motivo: document.getElementById('m-motivo').value.trim(),
    responsable: document.getElementById('m-responsable').value.trim() || 'Sistema'
  };

  if (!payload.cantidad || payload.cantidad <= 0) {
    showToast('Ingresa una cantidad válida', true);
    return;
  }

  try {
    await api.crearMovimiento(payload);
    showToast('Movimiento registrado correctamente');
    closeModal('modal-movimiento');
    loadMovimientos();
  } catch (err) {
    showToast('Error al registrar: ' + err.message, true);
  }
});
