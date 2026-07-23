// Vista de productos: listado, filtros y CRUD

let productosCache = [];

async function loadProductos() {
  try {
    const params = {};
    const q = document.getElementById('filtro-busqueda').value.trim();
    const categoria_id = document.getElementById('filtro-categoria').value;
    const bajoStock = document.getElementById('filtro-bajo-stock').checked;

    if (q) params.q = q;
    if (categoria_id) params.categoria_id = categoria_id;
    if (bajoStock) params.bajo_stock = '1';

    productosCache = await api.getProductos(params);
    renderTablaProductos(productosCache);
  } catch (err) {
    showToast('Error al cargar productos: ' + err.message, true);
  }
}

function renderTablaProductos(productos) {
  const tbody = document.getElementById('tabla-productos');
  const empty = document.getElementById('productos-empty');

  if (!productos.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = productos.map(p => {
    const pct = p.stock_minimo > 0 ? Math.min(100, (p.stock_actual / p.stock_minimo) * 100) : 100;
    const cls = stockFillClass(p.stock_actual, p.stock_minimo);
    const bajo = p.stock_actual <= p.stock_minimo;
    return `
      <tr>
        <td class="mono">${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.categoria_nombre || '—'}</td>
        <td class="num mono">${formatNumber(p.stock_actual)} ${p.unidad_medida}</td>
        <td><div class="stock-bar" style="width:80px"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div></td>
        <td class="num mono">${formatMoney(p.precio_compra)}</td>
        <td class="num mono">${formatMoney(p.precio_venta)}</td>
        <td><span class="badge ${bajo ? 'badge-warn' : 'badge-ok'}">${bajo ? 'Bajo stock' : 'Normal'}</span></td>
        <td class="actions-cell">
          <button class="btn btn-sm" onclick="editarProducto(${p.id})">Editar</button>
          <button class="btn btn-sm btn-danger-text" onclick="borrarProducto(${p.id})">Eliminar</button>
        </td>
      </tr>`;
  }).join('');
}

['filtro-busqueda', 'filtro-categoria', 'filtro-bajo-stock'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => loadProductos());
});

document.getElementById('btn-nuevo-producto').addEventListener('click', () => {
  document.getElementById('modal-producto-titulo').textContent = 'Nuevo producto';
  ['p-id','p-codigo','p-nombre','p-descripcion','p-ubicacion'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-categoria').value = '';
  document.getElementById('p-proveedor').value = '';
  document.getElementById('p-unidad').value = 'unidad';
  document.getElementById('p-stock-actual').value = 0;
  document.getElementById('p-stock-minimo').value = 0;
  document.getElementById('p-precio-compra').value = 0;
  document.getElementById('p-precio-venta').value = 0;
  document.getElementById('p-stock-inicial-wrap').style.display = 'flex';
  document.getElementById('p-stock-actual').disabled = false;
  openModal('modal-producto');
});

async function editarProducto(id) {
  try {
    const p = await api.getProducto(id);
    document.getElementById('modal-producto-titulo').textContent = 'Editar producto';
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-codigo').value = p.codigo;
    document.getElementById('p-nombre').value = p.nombre;
    document.getElementById('p-descripcion').value = p.descripcion || '';
    document.getElementById('p-categoria').value = p.categoria_id || '';
    document.getElementById('p-proveedor').value = p.proveedor_id || '';
    document.getElementById('p-unidad').value = p.unidad_medida;
    document.getElementById('p-stock-minimo').value = p.stock_minimo;
    document.getElementById('p-precio-compra').value = p.precio_compra;
    document.getElementById('p-precio-venta').value = p.precio_venta;
    document.getElementById('p-ubicacion').value = p.ubicacion || '';
    // El stock actual se gestiona vía módulo de Movimientos para mantener trazabilidad
    document.getElementById('p-stock-actual').value = p.stock_actual;
    document.getElementById('p-stock-actual').disabled = true;
    openModal('modal-producto');
  } catch (err) {
    showToast('Error al cargar el producto: ' + err.message, true);
  }
}

async function borrarProducto(id) {
  if (!confirm('¿Eliminar este producto? Esta acción se puede revertir desde la base de datos.')) return;
  try {
    await api.eliminarProducto(id);
    showToast('Producto eliminado correctamente');
    loadProductos();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, true);
  }
}

document.getElementById('btn-guardar-producto').addEventListener('click', async () => {
  const id = document.getElementById('p-id').value;
  const payload = {
    codigo: document.getElementById('p-codigo').value.trim(),
    nombre: document.getElementById('p-nombre').value.trim(),
    descripcion: document.getElementById('p-descripcion').value.trim(),
    categoria_id: document.getElementById('p-categoria').value || null,
    proveedor_id: document.getElementById('p-proveedor').value || null,
    unidad_medida: document.getElementById('p-unidad').value.trim() || 'unidad',
    stock_minimo: Number(document.getElementById('p-stock-minimo').value),
    precio_compra: Number(document.getElementById('p-precio-compra').value),
    precio_venta: Number(document.getElementById('p-precio-venta').value),
    ubicacion: document.getElementById('p-ubicacion').value.trim()
  };

  if (!payload.codigo || !payload.nombre) {
    showToast('Código y nombre son obligatorios', true);
    return;
  }

  try {
    if (id) {
      await api.actualizarProducto(id, payload);
      showToast('Producto actualizado correctamente');
    } else {
      payload.stock_actual = Number(document.getElementById('p-stock-actual').value);
      await api.crearProducto(payload);
      showToast('Producto creado correctamente');
    }
    closeModal('modal-producto');
    loadProductos();
    poblarSelectsCategoriaProveedor();
  } catch (err) {
    showToast('Error al guardar: ' + err.message, true);
  }
});
