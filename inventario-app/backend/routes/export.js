const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const pool = require('../config/db');

// GET /api/export/excel  -> descarga inventario_YYYY-MM-DD.xlsx
router.get('/excel', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM vista_inventario_valorizado ORDER BY nombre');
    const [movimientos] = await pool.query(`
      SELECT m.fecha, p.codigo, p.nombre, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo, m.motivo, m.responsable
      FROM movimientos_inventario m JOIN productos p ON p.id = m.producto_id
      ORDER BY m.fecha DESC LIMIT 500
    `);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Inventarios';
    workbook.created = new Date();

    // --- Hoja Inventario ---
    const hojaInv = workbook.addWorksheet('Inventario');
    hojaInv.columns = [
      { header: 'Código', key: 'codigo', width: 14 },
      { header: 'Producto', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 18 },
      { header: 'Proveedor', key: 'proveedor', width: 20 },
      { header: 'Stock actual', key: 'stock_actual', width: 14 },
      { header: 'Stock mínimo', key: 'stock_minimo', width: 14 },
      { header: 'Unidad', key: 'unidad_medida', width: 12 },
      { header: 'Precio compra', key: 'precio_compra', width: 14 },
      { header: 'Precio venta', key: 'precio_venta', width: 14 },
      { header: 'Valor inv. (compra)', key: 'valor_inventario_compra', width: 18 },
      { header: 'Valor inv. (venta)', key: 'valor_inventario_venta', width: 18 },
      { header: 'Estado', key: 'estado_stock', width: 14 },
      { header: 'Ubicación', key: 'ubicacion', width: 16 }
    ];
    hojaInv.getRow(1).font = { bold: true };
    hojaInv.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEEEA' } };
    productos.forEach(p => hojaInv.addRow(p));
    hojaInv.autoFilter = { from: 'A1', to: 'M1' };

    // --- Hoja Movimientos ---
    const hojaMov = workbook.addWorksheet('Movimientos');
    hojaMov.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Código', key: 'codigo', width: 14 },
      { header: 'Producto', key: 'nombre', width: 28 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Cantidad', key: 'cantidad', width: 12 },
      { header: 'Stock anterior', key: 'stock_anterior', width: 14 },
      { header: 'Stock nuevo', key: 'stock_nuevo', width: 14 },
      { header: 'Motivo', key: 'motivo', width: 24 },
      { header: 'Responsable', key: 'responsable', width: 18 }
    ];
    hojaMov.getRow(1).font = { bold: true };
    hojaMov.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEEEA' } };
    movimientos.forEach(m => hojaMov.addRow(m));
    hojaMov.autoFilter = { from: 'A1', to: 'I1' };

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=inventario_${fecha}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/export/csv -> CSV plano, ideal para "Obtener datos > Web/Texto CSV" en Power BI
router.get('/csv', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vista_inventario_valorizado ORDER BY nombre');
    const headers = Object.keys(rows[0] || {
      id: '', codigo: '', nombre: '', categoria: '', proveedor: '', stock_actual: '',
      stock_minimo: '', unidad_medida: '', precio_compra: '', precio_venta: '',
      valor_inventario_compra: '', valor_inventario_venta: '', estado_stock: '', ubicacion: '', activo: ''
    });
    const escape = v => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(','))
    ].join('\n');

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=inventario_powerbi_${fecha}.csv`);
    res.send('\uFEFF' + csv); // BOM para acentos en Excel/Power BI
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
