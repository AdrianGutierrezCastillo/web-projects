const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/stats', async (req, res) => {
  try {
    const [[resumen]] = await pool.query(`
      SELECT
        COUNT(*) AS total_productos,
        COALESCE(SUM(stock_actual * precio_compra), 0) AS valor_inventario,
        SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) AS productos_bajo_stock
      FROM productos WHERE activo = 1
    `);

    const [totalCategorias] = await pool.query('SELECT COUNT(*) AS total FROM categorias');

    const [porCategoria] = await pool.query(`
      SELECT c.nombre AS categoria, COALESCE(SUM(p.stock_actual * p.precio_compra), 0) AS valor
      FROM categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo = 1
      GROUP BY c.id, c.nombre
      HAVING valor > 0
      ORDER BY valor DESC
    `);

    const [movimientos7dias] = await pool.query(`
      SELECT DATE(fecha) AS dia,
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) AS entradas,
        SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) AS salidas
      FROM movimientos_inventario
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(fecha)
      ORDER BY dia ASC
    `);

    const [bajoStock] = await pool.query(`
      SELECT id, codigo, nombre, stock_actual, stock_minimo, unidad_medida
      FROM productos
      WHERE activo = 1 AND stock_actual <= stock_minimo
      ORDER BY (stock_actual - stock_minimo) ASC
      LIMIT 8
    `);

    const [ultimosMovimientos] = await pool.query(`
      SELECT m.id, m.tipo, m.cantidad, m.fecha, p.nombre AS producto_nombre, p.codigo AS producto_codigo
      FROM movimientos_inventario m
      JOIN productos p ON p.id = m.producto_id
      ORDER BY m.fecha DESC
      LIMIT 6
    `);

    res.json({
      total_productos: resumen.total_productos,
      valor_inventario: resumen.valor_inventario,
      productos_bajo_stock: resumen.productos_bajo_stock,
      total_categorias: totalCategorias[0].total,
      por_categoria: porCategoria,
      movimientos_7dias: movimientos7dias,
      bajo_stock: bajoStock,
      ultimos_movimientos: ultimosMovimientos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
