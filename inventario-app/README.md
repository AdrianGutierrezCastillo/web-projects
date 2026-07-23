# Sistema de Control de Inventarios

Aplicación web completa para gestión de inventarios: productos, categorías, proveedores,
movimientos de stock, dashboard con gráficos y exportación a Excel / Power BI.

**Stack:** HTML + CSS + JavaScript (vanilla) en el frontend, Node.js + Express en el backend,
MySQL como base de datos.

## Estructura del proyecto

```
inventario-app/
├── database/
│   └── schema.sql          # Tablas, vista para Power BI y datos de ejemplo
├── backend/
│   ├── server.js           # Servidor Express (API + sirve el frontend)
│   ├── config/db.js        # Conexión a MySQL (pool)
│   ├── routes/              # productos, categorias, proveedores, movimientos, dashboard, export
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/ (api.js, app.js, dashboard.js, productos.js, movimientos.js, categorias.js, proveedores.js)
```

## 1. Preparar la base de datos

Con MySQL corriendo localmente (o en un servidor accesible):

```bash
mysql -u root -p < database/schema.sql
```

Esto crea la base `inventario_db`, sus tablas, una vista `vista_inventario_valorizado`
(pensada para Power BI) y algunos productos de ejemplo.

## 2. Configurar y levantar el backend

```bash
cd backend
cp .env.example .env      # edita usuario/clave/host de tu MySQL
npm install
npm start                 # o: npm run dev (con nodemon)
```

El servidor queda disponible en `http://localhost:4000` y también sirve el frontend,
así que basta con abrir esa URL en el navegador — no hace falta un servidor aparte
para los archivos estáticos.

## 3. Usar el dashboard

- **Dashboard**: KPIs (productos activos, valor de inventario, bajo stock, categorías),
  gráfico de entradas/salidas de 7 días, valor por categoría, alertas de bajo stock y
  últimos movimientos.
- **Productos**: alta, edición, baja lógica, búsqueda y filtro por categoría / bajo stock.
- **Movimientos**: registra entradas, salidas o ajustes; el stock se actualiza en una
  transacción y queda trazabilidad completa.
- **Categorías / Proveedores**: catálogos de apoyo.
- **Exportar**: descarga directa de Excel y CSV.

## 4. Exportar a Excel

Botón **Exportar Excel** (dashboard o sección Exportar) descarga un `.xlsx` con dos hojas:
`Inventario` (valorizado) y `Movimientos` (últimos 500), generado en el servidor con `exceljs`.

Endpoint directo: `GET /api/export/excel`

## 5. Conectar con Power BI

Hay dos formas de traer los datos a Power BI:

**a) Archivo CSV (más simple)**
1. Descarga el CSV desde la sección Exportar (`GET /api/export/csv`).
2. En Power BI Desktop: `Obtener datos → Texto/CSV` → selecciona el archivo → `Cargar`.

**b) Conexión en vivo a MySQL (recomendado para datos siempre actualizados)**
1. En Power BI Desktop: `Obtener datos → Base de datos → Base de datos MySQL`.
2. Servidor: `host:puerto` de tu MySQL. Base de datos: `inventario_db`.
3. Selecciona la vista `vista_inventario_valorizado` (ya trae el inventario valorizado
   y el estado de stock calculado) o las tablas `productos`, `movimientos_inventario`, etc.
4. Elige modo **Import** o **DirectQuery** según si necesitas datos en tiempo real.
5. Requiere el conector "MySQL for Power BI" (Oracle MySQL Connector/NET), instálalo si
   Power BI lo solicita.

## Notas

- El borrado de productos es lógico (`activo = 0`), así se conserva el historial de movimientos.
- El stock de un producto **no se edita directamente**: se ajusta siempre mediante el
  módulo de Movimientos, para mantener trazabilidad completa (entradas, salidas, ajustes).
- Puedes cambiar el puerto del backend en `backend/.env` (`PORT`).
