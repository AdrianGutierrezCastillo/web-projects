// Navegación entre vistas, modales y utilidades compartidas

function formatMoney(n) {
  return 'Bs ' + Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString('es-BO', { maximumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 2800);
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});

// --- Navegación por vistas ---
const views = ['dashboard', 'productos', 'movimientos', 'categorias', 'proveedores', 'exportar'];

function setView(name) {
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle('active', v === name);
  });
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === name);
  });

  if (name === 'dashboard') loadDashboard();
  if (name === 'productos') loadProductos();
  if (name === 'movimientos') loadMovimientos();
  if (name === 'categorias') loadCategorias();
  if (name === 'proveedores') loadProveedores();
}

document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', () => setView(item.dataset.view));
});

// --- Poblar selects de categoría/proveedor reutilizables ---
async function poblarSelectsCategoriaProveedor() {
  try {
    const [categorias, proveedores] = await Promise.all([api.getCategorias(), api.getProveedores()]);

    const selCat = document.getElementById('p-categoria');
    selCat.innerHTML = '<option value="">Sin categoría</option>' +
      categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const selProv = document.getElementById('p-proveedor');
    selProv.innerHTML = '<option value="">Sin proveedor</option>' +
      proveedores.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

    const filtroCat = document.getElementById('filtro-categoria');
    filtroCat.innerHTML = '<option value="">Todas las categorías</option>' +
      categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  } catch (err) {
    console.error(err);
  }
}

// --- Chequeo de estado del backend/DB ---
async function checkDbStatus() {
  const el = document.getElementById('db-status');
  try {
    await api.getStats();
    el.textContent = 'conectado ✓';
  } catch {
    el.textContent = 'sin conexión ✕';
  }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
  poblarSelectsCategoriaProveedor();
  checkDbStatus();
  setView('dashboard');
});
