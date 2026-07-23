-- ============================================================
-- Sistema de Control de Inventarios - Esquema de Base de Datos
-- Motor: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS inventario_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventario_db;

-- ------------------------------------------------------------
-- Tabla: categorias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: proveedores
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(100) DEFAULT NULL,
  telefono VARCHAR(30) DEFAULT NULL,
  email VARCHAR(120) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: productos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) DEFAULT NULL,
  categoria_id INT DEFAULT NULL,
  proveedor_id INT DEFAULT NULL,
  stock_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_minimo DECIMAL(12,2) NOT NULL DEFAULT 0,
  unidad_medida VARCHAR(30) DEFAULT 'unidad',
  precio_compra DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(12,2) NOT NULL DEFAULT 0,
  ubicacion VARCHAR(100) DEFAULT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: movimientos_inventario (entradas, salidas, ajustes)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  tipo ENUM('entrada','salida','ajuste') NOT NULL,
  cantidad DECIMAL(12,2) NOT NULL,
  stock_anterior DECIMAL(12,2) NOT NULL,
  stock_nuevo DECIMAL(12,2) NOT NULL,
  motivo VARCHAR(255) DEFAULT NULL,
  responsable VARCHAR(100) DEFAULT 'Sistema',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);

-- ------------------------------------------------------------
-- Vista para Power BI / reportes: inventario valorizado
-- Power BI puede conectarse directamente a esta vista
-- (Obtener datos > MySQL database > seleccionar "vista_inventario_valorizado")
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vista_inventario_valorizado AS
SELECT
  p.id,
  p.codigo,
  p.nombre,
  c.nombre AS categoria,
  pr.nombre AS proveedor,
  p.stock_actual,
  p.stock_minimo,
  p.unidad_medida,
  p.precio_compra,
  p.precio_venta,
  ROUND(p.stock_actual * p.precio_compra, 2) AS valor_inventario_compra,
  ROUND(p.stock_actual * p.precio_venta, 2) AS valor_inventario_venta,
  CASE WHEN p.stock_actual <= p.stock_minimo THEN 'Bajo stock' ELSE 'Normal' END AS estado_stock,
  p.ubicacion,
  p.activo
FROM productos p
LEFT JOIN categorias c ON c.id = p.categoria_id
LEFT JOIN proveedores pr ON pr.id = p.proveedor_id;

-- ------------------------------------------------------------
-- Datos de ejemplo
-- ------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica', 'Componentes y dispositivos electrónicos'),
  ('Oficina', 'Suministros y papelería de oficina'),
  ('Limpieza', 'Artículos de limpieza e higiene'),
  ('Ferretería', 'Herramientas y materiales')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
  ('Distribuidora Central', 'Marco Vega', '77712345', 'ventas@central.com'),
  ('Importadora Andina', 'Lucía Rojas', '77798765', 'contacto@andina.com')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, stock_actual, stock_minimo, unidad_medida, precio_compra, precio_venta, ubicacion) VALUES
  ('ELE-001', 'Cable HDMI 2m', 'Cable HDMI alta velocidad', 1, 1, 45, 10, 'unidad', 15.00, 28.00, 'Estante A1'),
  ('ELE-002', 'Mouse inalámbrico', 'Mouse óptico inalámbrico', 1, 2, 8, 15, 'unidad', 35.00, 60.00, 'Estante A2'),
  ('OFI-001', 'Resma papel carta', 'Papel bond 75g', 2, 1, 120, 30, 'paquete', 22.00, 32.00, 'Estante B1'),
  ('LIM-001', 'Detergente 1L', 'Detergente multiusos', 3, 2, 5, 20, 'botella', 8.00, 14.00, 'Estante C1'),
  ('FER-001', 'Taladro eléctrico', 'Taladro percutor 650W', 4, 1, 3, 5, 'unidad', 250.00, 380.00, 'Estante D1')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
