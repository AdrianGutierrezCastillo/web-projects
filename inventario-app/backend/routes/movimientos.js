const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/movimientos?limit=50&producto_id=
router.get('/', async (req, res) => {
  try {
    const { limit = 50, producto_id } = req.query;
    let sql = `
      SELECT m.*, p.nombre AS producto_nombre, p.codigo AS producto_codigo
      FROM movimientos_inventario m
      JOIN productos p ON p.id = m.producto_id
    `;
    const params = [];
    if (producto_id) {
      sql += ' WHERE m.producto_id = ?';
      params.push(producto_id);
    }
    sql += ' ORDER BY m.fecha DESC LIMIT ?';
    params.push(Number(limit));

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/movimientos  { producto_id, tipo, cantidad, motivo, responsable }
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { producto_id, tipo, cantidad, motivo, responsable } = req.body;

    if (!producto_id || !tipo || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'producto_id, tipo y cantidad (>0) son obligatorios' });
    }
    if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo inválido. Use entrada, salida o ajuste' });
    }

    await conn.beginTransaction();

    const [productos] = await conn.query('SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
    if (!productos.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stockAnterior = Number(productos[0].stock_actual);
    let stockNuevo;
    if (tipo === 'entrada') stockNuevo = stockAnterior + Number(cantidad);
    else if (tipo === 'salida') stockNuevo = stockAnterior - Number(cantidad);
    else stockNuevo = Number(cantidad); // ajuste: establece el stock directamente

    if (stockNuevo < 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Stock insuficiente para esta salida' });
    }

    await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stockNuevo, producto_id]);
    await conn.query(
      `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, responsable)
       VALUES (?,?,?,?,?,?,?)`,
      [producto_id, tipo, cantidad, stockAnterior, stockNuevo, motivo || null, responsable || 'Sistema']
    );

    await conn.commit();
    res.status(201).json({ message: 'Movimiento registrado correctamente', stock_nuevo: stockNuevo });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
