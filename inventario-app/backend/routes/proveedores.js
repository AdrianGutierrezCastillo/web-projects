const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const [result] = await pool.query(
      'INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?,?,?,?,?)',
      [nombre, contacto || null, telefono || null, email || null, direccion || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Proveedor creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM proveedores WHERE id = ?', [req.params.id]);
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
