// Dashboard: KPIs, gráficos y listas resumen

let chartMovimientos, chartCategorias;

function stockFillClass(actual, minimo) {
  if (actual <= 0) return 'critical';
  if (actual <= minimo) return 'low';
  return '';
}

async function loadDashboard() {
  try {
    const stats = await api.getStats();

    document.getElementById('kpi-total-productos').textContent = formatNumber(stats.total_productos);
    document.getElementById('kpi-valor').textContent = formatMoney(stats.valor_inventario);
    document.getElementById('kpi-bajo-stock').textContent = formatNumber(stats.productos_bajo_stock);
    document.getElementById('kpi-categorias').textContent = formatNumber(stats.total_categorias);

    renderChartMovimientos(stats.movimientos_7dias);
    renderChartCategorias(stats.por_categoria);
    renderBajoStock(stats.bajo_stock);
    renderUltimosMovimientos(stats.ultimos_movimientos);
  } catch (err) {
    showToast('No se pudo cargar el dashboard: ' + err.message, true);
  }
}

function renderChartMovimientos(data) {
  const labels = data.map(d => new Date(d.dia).toLocaleDateString('es-BO', { weekday: 'short' }));
  const entradas = data.map(d => Number(d.entradas));
  const salidas = data.map(d => Number(d.salidas));

  const ctx = document.getElementById('chart-movimientos');
  if (chartMovimientos) chartMovimientos.destroy();
  chartMovimientos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Sin datos'],
      datasets: [
        { label: 'Entradas', data: entradas, backgroundColor: '#2F6F4F', borderRadius: 4, maxBarThickness: 22 },
        { label: 'Salidas', data: salidas, backgroundColor: '#D8D5CF', borderRadius: 4, maxBarThickness: 22 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: '#F0EFEC' }, beginAtZero: true }
      }
    }
  });
}

function renderChartCategorias(data) {
  const palette = ['#2F6F4F', '#6B8F7C', '#A9C2B2', '#B54708', '#D9A066', '#C9C6C0'];
  const ctx = document.getElementById('chart-categorias');
  if (chartCategorias) chartCategorias.destroy();
  chartCategorias = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.length ? data.map(d => d.categoria) : ['Sin datos'],
      datasets: [{
        data: data.length ? data.map(d => d.valor) : [1],
        backgroundColor: data.length ? palette : ['#E6E4E1'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }
    }
  });
}

function renderBajoStock(items) {
  const wrap = document.getElementById('lista-bajo-stock');
  document.getElementById('bajo-stock-count').textContent = items.length ? `${items.length} producto(s)` : '';

  if (!items.length) {
    wrap.innerHTML = '<div class="empty-state">Todo el stock está en niveles saludables.</div>';
    return;
  }

  wrap.innerHTML = items.map(p => {
    const pct = p.stock_minimo > 0 ? Math.min(100, (p.stock_actual / p.stock_minimo) * 100) : 0;
    const cls = stockFillClass(p.stock_actual, p.stock_minimo);
    return `
      <div class="stock-row">
        <div class="stock-row-info">
          <div class="stock-row-name">${p.nombre}</div>
          <div class="stock-row-meta mono">${p.codigo}</div>
        </div>
        <div class="stock-row-bar">
          <div class="stock-bar"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div>
        </div>
        <div class="stock-row-value mono">${formatNumber(p.stock_actual)} / ${formatNumber(p.stock_minimo)}</div>
      </div>`;
  }).join('');
}

function renderUltimosMovimientos(items) {
  const wrap = document.getElementById('lista-movimientos');
  if (!items.length) {
    wrap.innerHTML = '<div class="empty-state">Sin movimientos recientes.</div>';
    return;
  }
  const tipoBadge = { entrada: 'badge-ok', salida: 'badge-danger', ajuste: 'badge-neutral' };
  const tipoLabel = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' };

  wrap.innerHTML = items.map(m => `
    <div class="stock-row">
      <div class="stock-row-info">
        <div class="stock-row-name">${m.producto_nombre}</div>
        <div class="stock-row-meta">${formatDate(m.fecha)}</div>
      </div>
      <span class="badge ${tipoBadge[m.tipo]}">${tipoLabel[m.tipo]}</span>
      <div class="stock-row-value mono">${formatNumber(m.cantidad)}</div>
    </div>
  `).join('');
}
