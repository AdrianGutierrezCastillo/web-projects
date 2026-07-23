const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/productos  -> lista con filtros opcionales (?q=&categoria_id=&bajo_stock=1)
router.get('/', async (req, res) => {
  try {
    const { q, categoria_id, bajo_stock } = req.query;
    let sql = `
      SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
      WHERE p.activo = 1
    `;
    const params = [];

    if (q) {
      sql += ' AND (p.nombre LIKE ? OR p.codigo LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (categoria_id) {
      sql += ' AND p.categoria_id = ?';
      params.push(categoria_id);
    }
    if (bajo_stock === '1') {
      sql += ' AND p.stock_actual <= p.stock_minimo';
    }
    sql += ' ORDER BY p.fecha_actualizacion DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/productos
router.post('/', async (req, res) => {
  try {
    const {
      codigo, nombre, descripcion, categoria_id, proveedor_id,
      stock_actual = 0, stock_minimo = 0, unidad_medida = 'unidad',
      precio_compra = 0, precio_venta = 0, ubicacion
    } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'Código y nombre son obligatorios' });
    }

    const [result] = await pool.query(
      `INSERT INTO productos
        (codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, unidad_medida, precio_compra, precio_venta, ubicacion)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [codigo, nombre, descripcion || null, categoria_id || null, proveedor_id || null,
       stock_actual, stock_minimo, unidad_medida, precio_compra, precio_venta, ubicacion || null]
    );

    // Si el producto se crea con stock inicial, registrar movimiento
    if (Number(stock_actual) > 0) {
      await pool.query(
        `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo)
         VALUES (?, 'entrada', ?, 0, ?, 'Stock inicial')`,
        [result.insertId, stock_actual, stock_actual]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Producto creado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      codigo, nombre, descripcion, categoria_id, proveedor_id,
      stock_minimo, unidad_medida, precio_compra, precio_venta, ubicacion
    } = req.body;

    await pool.query(
      `UPDATE productos SET
        codigo = ?, nombre = ?, descripcion = ?, categoria_id = ?, proveedor_id = ?,
        stock_minimo = ?, unidad_medida = ?, precio_compra = ?, precio_venta = ?, ubicacion = ?
       WHERE id = ?`,
      [codigo, nombre, descripcion || null, categoria_id || null, proveedor_id || null,
       stock_minimo, unidad_medida, precio_compra, precio_venta, ubicacion || null, req.params.id]
    );
    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/productos/:id  -> baja lógica
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
