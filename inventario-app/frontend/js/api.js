// Cliente ligero para consumir la API REST del backend
const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

const api = {
  // Productos
  getProductos: (params = {}) => apiRequest(`/productos?${new URLSearchParams(params)}`),
  getProducto: id => apiRequest(`/productos/${id}`),
  crearProducto: data => apiRequest('/productos', { method: 'POST', body: JSON.stringify(data) }),
  actualizarProducto: (id, data) => apiRequest(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  eliminarProducto: id => apiRequest(`/productos/${id}`, { method: 'DELETE' }),

  // Categorías
  getCategorias: () => apiRequest('/categorias'),
  crearCategoria: data => apiRequest('/categorias', { method: 'POST', body: JSON.stringify(data) }),
  eliminarCategoria: id => apiRequest(`/categorias/${id}`, { method: 'DELETE' }),

  // Proveedores
  getProveedores: () => apiRequest('/proveedores'),
  crearProveedor: data => apiRequest('/proveedores', { method: 'POST', body: JSON.stringify(data) }),
  eliminarProveedor: id => apiRequest(`/proveedores/${id}`, { method: 'DELETE' }),

  // Movimientos
  getMovimientos: (params = {}) => apiRequest(`/movimientos?${new URLSearchParams(params)}`),
  crearMovimiento: data => apiRequest('/movimientos', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard
  getStats: () => apiRequest('/dashboard/stats')
};
