-- ============================================================
--  LUXESHOP — SQL Server Database Script
--  Compatible con SQL Server Management Studio 20
--  Ejecutar en orden: primero la BD, luego tablas, luego datos
-- ============================================================

USE master;
GO

-- ── Crear la base de datos si no existe ──────────────────────
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'LuxeShopDB')
BEGIN
    CREATE DATABASE LuxeShopDB
    COLLATE Latin1_General_CI_AI;
    PRINT 'Base de datos LuxeShopDB creada exitosamente.';
END
ELSE
    PRINT 'La base de datos LuxeShopDB ya existe.';
GO

USE LuxeShopDB;
GO

-- ============================================================
--  TABLA: Roles
-- ============================================================
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RolID       INT IDENTITY(1,1) PRIMARY KEY,
        Nombre      NVARCHAR(50)  NOT NULL UNIQUE,   -- 'admin' | 'cliente'
        Descripcion NVARCHAR(200) NULL,
        Activo      BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Roles creada.';
END
GO

-- ============================================================
--  TABLA: Usuarios
-- ============================================================
IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios (
        UsuarioID       INT IDENTITY(1,1) PRIMARY KEY,
        RolID           INT NOT NULL,
        Nombre          NVARCHAR(100) NOT NULL,
        Apellido        NVARCHAR(100) NOT NULL,
        Email           NVARCHAR(200) NOT NULL UNIQUE,
        PasswordHash    NVARCHAR(512) NOT NULL,   -- bcrypt / SHA-256 hash
        Telefono        NVARCHAR(20)  NULL,
        Avatar          NVARCHAR(500) NULL,       -- URL imagen
        Activo          BIT NOT NULL DEFAULT 1,
        EmailVerificado BIT NOT NULL DEFAULT 0,
        UltimoAcceso    DATETIME NULL,
        FechaCreacion   DATETIME NOT NULL DEFAULT GETDATE(),
        FechaActualizacion DATETIME NULL,
        CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolID) REFERENCES dbo.Roles(RolID)
    );
    CREATE INDEX IX_Usuarios_Email  ON dbo.Usuarios(Email);
    CREATE INDEX IX_Usuarios_RolID  ON dbo.Usuarios(RolID);
    PRINT 'Tabla Usuarios creada.';
END
GO

-- ============================================================
--  TABLA: Categorias
-- ============================================================
IF OBJECT_ID('dbo.Categorias', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categorias (
        CategoriaID   INT IDENTITY(1,1) PRIMARY KEY,
        Nombre        NVARCHAR(100) NOT NULL UNIQUE,
        Slug          NVARCHAR(100) NOT NULL UNIQUE,  -- URL-friendly
        Descripcion   NVARCHAR(500) NULL,
        ImagenURL     NVARCHAR(500) NULL,
        Activa        BIT NOT NULL DEFAULT 1,
        Orden         INT NOT NULL DEFAULT 0,         -- orden de aparición
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Categorias creada.';
END
GO

-- ============================================================
--  TABLA: Marcas
-- ============================================================
IF OBJECT_ID('dbo.Marcas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Marcas (
        MarcaID       INT IDENTITY(1,1) PRIMARY KEY,
        Nombre        NVARCHAR(100) NOT NULL UNIQUE,
        LogoURL       NVARCHAR(500) NULL,
        Activa        BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Marcas creada.';
END
GO

-- ============================================================
--  TABLA: Productos
-- ============================================================
IF OBJECT_ID('dbo.Productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos (
        ProductoID      INT IDENTITY(1,1) PRIMARY KEY,
        CategoriaID     INT NOT NULL,
        MarcaID         INT NULL,
        Nombre          NVARCHAR(200) NOT NULL,
        Slug            NVARCHAR(200) NOT NULL UNIQUE,
        Descripcion     NVARCHAR(MAX) NULL,
        DescripcionCorta NVARCHAR(500) NULL,
        Precio          DECIMAL(10,2) NOT NULL,
        PrecioAnterior  DECIMAL(10,2) NULL,          -- precio tachado
        Costo           DECIMAL(10,2) NULL,          -- solo visible por admin
        Stock           INT NOT NULL DEFAULT 0,
        StockMinimo     INT NOT NULL DEFAULT 5,      -- alerta de bajo stock
        SKU             NVARCHAR(100) NOT NULL UNIQUE,
        CodigoBarras    NVARCHAR(100) NULL,
        ImagenPrincipal NVARCHAR(500) NULL,
        Peso            DECIMAL(8,3) NULL,           -- kg
        Activo          BIT NOT NULL DEFAULT 1,
        Destacado       BIT NOT NULL DEFAULT 0,
        Nuevo           BIT NOT NULL DEFAULT 0,
        Badge           NVARCHAR(50) NULL,           -- 'new'|'sale'|'hot'
        Vistas          INT NOT NULL DEFAULT 0,
        TotalVendido    INT NOT NULL DEFAULT 0,
        FechaCreacion   DATETIME NOT NULL DEFAULT GETDATE(),
        FechaActualizacion DATETIME NULL,
        CONSTRAINT FK_Productos_Categorias FOREIGN KEY (CategoriaID) REFERENCES dbo.Categorias(CategoriaID),
        CONSTRAINT FK_Productos_Marcas     FOREIGN KEY (MarcaID)     REFERENCES dbo.Marcas(MarcaID),
        CONSTRAINT CK_Productos_Precio     CHECK (Precio >= 0),
        CONSTRAINT CK_Productos_Stock      CHECK (Stock >= 0)
    );
    CREATE INDEX IX_Productos_CategoriaID ON dbo.Productos(CategoriaID);
    CREATE INDEX IX_Productos_Activo      ON dbo.Productos(Activo);
    CREATE INDEX IX_Productos_Slug        ON dbo.Productos(Slug);
    PRINT 'Tabla Productos creada.';
END
GO

-- ============================================================
--  TABLA: ProductoImagenes (galería de imágenes)
-- ============================================================
IF OBJECT_ID('dbo.ProductoImagenes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductoImagenes (
        ImagenID    INT IDENTITY(1,1) PRIMARY KEY,
        ProductoID  INT NOT NULL,
        URL         NVARCHAR(500) NOT NULL,
        AltText     NVARCHAR(200) NULL,
        Orden       INT NOT NULL DEFAULT 0,
        EsPrincipal BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_ProductoImagenes_Productos FOREIGN KEY (ProductoID) REFERENCES dbo.Productos(ProductoID) ON DELETE CASCADE
    );
    PRINT 'Tabla ProductoImagenes creada.';
END
GO

-- ============================================================
--  TABLA: Cupones
-- ============================================================
IF OBJECT_ID('dbo.Cupones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cupones (
        CuponID        INT IDENTITY(1,1) PRIMARY KEY,
        Codigo         NVARCHAR(50)  NOT NULL UNIQUE,
        Descripcion    NVARCHAR(300) NULL,
        Tipo           NVARCHAR(20)  NOT NULL,      -- 'porcentaje' | 'fijo'
        Valor          DECIMAL(10,2) NOT NULL,
        ValorMinimo    DECIMAL(10,2) NULL,           -- compra mínima para aplicar
        UsosMaximos    INT NULL,                     -- NULL = ilimitado
        UsosActuales   INT NOT NULL DEFAULT 0,
        UsoPorUsuario  INT NOT NULL DEFAULT 1,       -- max usos por cliente
        FechaInicio    DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        FechaFin       DATE NULL,
        Activo         BIT NOT NULL DEFAULT 1,
        FechaCreacion  DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT CK_Cupones_Tipo  CHECK (Tipo IN ('porcentaje','fijo')),
        CONSTRAINT CK_Cupones_Valor CHECK (Valor > 0)
    );
    PRINT 'Tabla Cupones creada.';
END
GO

-- ============================================================
--  TABLA: Direcciones
-- ============================================================
IF OBJECT_ID('dbo.Direcciones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Direcciones (
        DireccionID   INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID     INT NOT NULL,
        Alias         NVARCHAR(50) NULL,           -- 'Casa', 'Trabajo'
        NombreReceptor NVARCHAR(200) NOT NULL,
        Telefono      NVARCHAR(20) NULL,
        Calle         NVARCHAR(300) NOT NULL,
        Ciudad        NVARCHAR(100) NOT NULL,
        Estado        NVARCHAR(100) NULL,
        CodigoPostal  NVARCHAR(20)  NULL,
        Pais          NVARCHAR(100) NOT NULL DEFAULT 'Bolivia',
        EsPrincipal   BIT NOT NULL DEFAULT 0,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Direcciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE
    );
    PRINT 'Tabla Direcciones creada.';
END
GO

-- ============================================================
--  TABLA: Pedidos
-- ============================================================
IF OBJECT_ID('dbo.Pedidos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Pedidos (
        PedidoID       INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID      INT NOT NULL,
        DireccionID    INT NULL,
        CuponID        INT NULL,
        NumeroPedido   NVARCHAR(20) NOT NULL UNIQUE,  -- 'LS-000001'
        Estado         NVARCHAR(50) NOT NULL DEFAULT 'pendiente',
            -- pendiente | confirmado | preparando | enviado | entregado | cancelado | devuelto
        MetodoPago     NVARCHAR(50) NOT NULL,          -- 'tarjeta' | 'paypal' | 'transferencia'
        EstadoPago     NVARCHAR(30) NOT NULL DEFAULT 'pendiente',
            -- pendiente | pagado | fallido | reembolsado
        Subtotal       DECIMAL(10,2) NOT NULL,
        Descuento      DECIMAL(10,2) NOT NULL DEFAULT 0,
        Envio          DECIMAL(10,2) NOT NULL DEFAULT 0,
        Impuesto       DECIMAL(10,2) NOT NULL DEFAULT 0,
        Total          DECIMAL(10,2) NOT NULL,
        NotasCliente   NVARCHAR(500) NULL,
        NotasAdmin     NVARCHAR(500) NULL,
        FechaPedido    DATETIME NOT NULL DEFAULT GETDATE(),
        FechaEnvio     DATETIME NULL,
        FechaEntrega   DATETIME NULL,
        NumeroSeguimiento NVARCHAR(100) NULL,
        CONSTRAINT FK_Pedidos_Usuarios   FOREIGN KEY (UsuarioID)   REFERENCES dbo.Usuarios(UsuarioID),
        CONSTRAINT FK_Pedidos_Direcciones FOREIGN KEY (DireccionID) REFERENCES dbo.Direcciones(DireccionID),
        CONSTRAINT FK_Pedidos_Cupones    FOREIGN KEY (CuponID)     REFERENCES dbo.Cupones(CuponID),
        CONSTRAINT CK_Pedidos_Estado     CHECK (Estado IN ('pendiente','confirmado','preparando','enviado','entregado','cancelado','devuelto')),
        CONSTRAINT CK_Pedidos_EstadoPago CHECK (EstadoPago IN ('pendiente','pagado','fallido','reembolsado'))
    );
    CREATE INDEX IX_Pedidos_UsuarioID     ON dbo.Pedidos(UsuarioID);
    CREATE INDEX IX_Pedidos_Estado        ON dbo.Pedidos(Estado);
    CREATE INDEX IX_Pedidos_FechaPedido   ON dbo.Pedidos(FechaPedido);
    CREATE INDEX IX_Pedidos_NumeroPedido  ON dbo.Pedidos(NumeroPedido);
    PRINT 'Tabla Pedidos creada.';
END
GO

-- ============================================================
--  TABLA: DetallePedidos
-- ============================================================
IF OBJECT_ID('dbo.DetallePedidos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DetallePedidos (
        DetalleID   INT IDENTITY(1,1) PRIMARY KEY,
        PedidoID    INT NOT NULL,
        ProductoID  INT NOT NULL,
        NombreProducto NVARCHAR(200) NOT NULL,  -- snapshot al momento del pedido
        PrecioUnitario DECIMAL(10,2) NOT NULL,
        Cantidad    INT NOT NULL,
        Subtotal    AS (PrecioUnitario * Cantidad) PERSISTED,
        CONSTRAINT FK_DetallePedidos_Pedidos   FOREIGN KEY (PedidoID)   REFERENCES dbo.Pedidos(PedidoID)   ON DELETE CASCADE,
        CONSTRAINT FK_DetallePedidos_Productos FOREIGN KEY (ProductoID) REFERENCES dbo.Productos(ProductoID),
        CONSTRAINT CK_DetallePedidos_Cantidad  CHECK (Cantidad > 0)
    );
    PRINT 'Tabla DetallePedidos creada.';
END
GO

-- ============================================================
--  TABLA: Resenas (Reseñas de productos)
-- ============================================================
IF OBJECT_ID('dbo.Resenas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Resenas (
        ResenaID      INT IDENTITY(1,1) PRIMARY KEY,
        ProductoID    INT NOT NULL,
        UsuarioID     INT NOT NULL,
        Calificacion  TINYINT NOT NULL,          -- 1 a 5
        Titulo        NVARCHAR(200) NULL,
        Comentario    NVARCHAR(MAX) NULL,
        Verificada    BIT NOT NULL DEFAULT 0,    -- compra verificada
        Aprobada      BIT NOT NULL DEFAULT 0,    -- moderada por admin
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Resenas_Productos FOREIGN KEY (ProductoID) REFERENCES dbo.Productos(ProductoID) ON DELETE CASCADE,
        CONSTRAINT FK_Resenas_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios(UsuarioID),
        CONSTRAINT CK_Resenas_Calificacion CHECK (Calificacion BETWEEN 1 AND 5),
        CONSTRAINT UQ_Resenas_UsuarioProducto UNIQUE (UsuarioID, ProductoID)
    );
    PRINT 'Tabla Resenas creada.';
END
GO

-- ============================================================
--  TABLA: ListaDeseos
-- ============================================================
IF OBJECT_ID('dbo.ListaDeseos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ListaDeseos (
        ListaDeseoID  INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID     INT NOT NULL,
        ProductoID    INT NOT NULL,
        FechaAgregado DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_ListaDeseos_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE,
        CONSTRAINT FK_ListaDeseos_Productos FOREIGN KEY (ProductoID) REFERENCES dbo.Productos(ProductoID) ON DELETE CASCADE,
        CONSTRAINT UQ_ListaDeseos UNIQUE (UsuarioID, ProductoID)
    );
    PRINT 'Tabla ListaDeseos creada.';
END
GO

-- ============================================================
--  TABLA: Carrito (persistencia server-side)
-- ============================================================
IF OBJECT_ID('dbo.Carrito', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Carrito (
        CarritoID     INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID     INT NOT NULL,
        ProductoID    INT NOT NULL,
        Cantidad      INT NOT NULL DEFAULT 1,
        FechaAgregado DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Carrito_Usuarios  FOREIGN KEY (UsuarioID)  REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE,
        CONSTRAINT FK_Carrito_Productos FOREIGN KEY (ProductoID) REFERENCES dbo.Productos(ProductoID) ON DELETE CASCADE,
        CONSTRAINT UQ_Carrito UNIQUE (UsuarioID, ProductoID),
        CONSTRAINT CK_Carrito_Cantidad CHECK (Cantidad > 0)
    );
    PRINT 'Tabla Carrito creada.';
END
GO

-- ============================================================
--  TABLA: Configuracion (settings del sistema)
-- ============================================================
IF OBJECT_ID('dbo.Configuracion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Configuracion (
        ConfigID   INT IDENTITY(1,1) PRIMARY KEY,
        Clave      NVARCHAR(100) NOT NULL UNIQUE,
        Valor      NVARCHAR(MAX) NULL,
        Tipo       NVARCHAR(30) NOT NULL DEFAULT 'texto',  -- texto|numero|booleano|json
        Descripcion NVARCHAR(300) NULL,
        FechaActualizacion DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Configuracion creada.';
END
GO

-- ============================================================
--  TABLA: LogActividad (auditoría de acciones admin)
-- ============================================================
IF OBJECT_ID('dbo.LogActividad', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LogActividad (
        LogID       INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID   INT NULL,
        Accion      NVARCHAR(100) NOT NULL,   -- 'crear_producto', 'eliminar_usuario', etc.
        Tabla       NVARCHAR(100) NULL,
        RegistroID  INT NULL,
        Detalle     NVARCHAR(MAX) NULL,        -- JSON con datos antes/después
        IPAddress   NVARCHAR(50) NULL,
        FechaAccion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_LogActividad_Usuarios FOREIGN KEY (UsuarioID) REFERENCES dbo.Usuarios(UsuarioID) ON DELETE SET NULL
    );
    CREATE INDEX IX_LogActividad_UsuarioID ON dbo.LogActividad(UsuarioID);
    CREATE INDEX IX_LogActividad_Fecha     ON dbo.LogActividad(FechaAccion);
    PRINT 'Tabla LogActividad creada.';
END
GO

-- ============================================================
--  TABLA: Notificaciones
-- ============================================================
IF OBJECT_ID('dbo.Notificaciones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notificaciones (
        NotificacionID INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID      INT NOT NULL,
        Tipo           NVARCHAR(50) NOT NULL,   -- 'pedido'|'promo'|'stock'|'sistema'
        Titulo         NVARCHAR(200) NOT NULL,
        Mensaje        NVARCHAR(MAX) NULL,
        Leida          BIT NOT NULL DEFAULT 0,
        URLAccion      NVARCHAR(500) NULL,
        FechaCreacion  DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_Notificaciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES dbo.Usuarios(UsuarioID) ON DELETE CASCADE
    );
    PRINT 'Tabla Notificaciones creada.';
END
GO

-- ============================================================
--  TABLA: Banners / Sliders
-- ============================================================
IF OBJECT_ID('dbo.Banners', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Banners (
        BannerID    INT IDENTITY(1,1) PRIMARY KEY,
        Titulo      NVARCHAR(200) NOT NULL,
        Subtitulo   NVARCHAR(300) NULL,
        ImagenURL   NVARCHAR(500) NOT NULL,
        URLDestino  NVARCHAR(500) NULL,
        Orden       INT NOT NULL DEFAULT 0,
        Activo      BIT NOT NULL DEFAULT 1,
        FechaInicio DATE NULL,
        FechaFin    DATE NULL,
        FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Tabla Banners creada.';
END
GO

-- ============================================================
--  STORED PROCEDURES
-- ============================================================

-- SP: Obtener resumen del dashboard (admin)
CREATE OR ALTER PROCEDURE dbo.sp_DashboardResumen
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM dbo.Pedidos WHERE FechaPedido >= CAST(GETDATE() AS DATE))          AS PedidosHoy,
        (SELECT COUNT(*) FROM dbo.Pedidos WHERE Estado = 'pendiente')                            AS PedidosPendientes,
        (SELECT COUNT(*) FROM dbo.Usuarios WHERE RolID = (SELECT RolID FROM dbo.Roles WHERE Nombre='cliente'))  AS TotalClientes,
        (SELECT COUNT(*) FROM dbo.Productos WHERE Activo = 1)                                     AS ProductosActivos,
        (SELECT COUNT(*) FROM dbo.Productos WHERE Stock <= StockMinimo AND Activo = 1)            AS ProductosBajoStock,
        (SELECT ISNULL(SUM(Total),0) FROM dbo.Pedidos
         WHERE EstadoPago = 'pagado'
           AND FechaPedido >= DATEADD(MONTH, DATEDIFF(MONTH,0,GETDATE()),0))                      AS VentasMesActual,
        (SELECT ISNULL(SUM(Total),0) FROM dbo.Pedidos
         WHERE EstadoPago = 'pagado'
           AND FechaPedido >= DATEADD(DAY,-6,CAST(GETDATE() AS DATE)))                           AS VentasUltimos7Dias;
END
GO

-- SP: Ventas por mes (últimos 12 meses)
CREATE OR ALTER PROCEDURE dbo.sp_VentasPorMes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        FORMAT(FechaPedido,'yyyy-MM') AS Mes,
        COUNT(*)                       AS TotalPedidos,
        SUM(Total)                     AS TotalVentas
    FROM dbo.Pedidos
    WHERE EstadoPago = 'pagado'
      AND FechaPedido >= DATEADD(YEAR,-1,GETDATE())
    GROUP BY FORMAT(FechaPedido,'yyyy-MM')
    ORDER BY Mes;
END
GO

-- SP: Productos más vendidos
CREATE OR ALTER PROCEDURE dbo.sp_TopProductos
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@Top)
        p.ProductoID, p.Nombre, p.Precio, p.ImagenPrincipal,
        p.TotalVendido,
        c.Nombre AS Categoria
    FROM dbo.Productos p
    INNER JOIN dbo.Categorias c ON p.CategoriaID = c.CategoriaID
    WHERE p.Activo = 1
    ORDER BY p.TotalVendido DESC;
END
GO

-- SP: Buscar productos (con paginación)
CREATE OR ALTER PROCEDURE dbo.sp_BuscarProductos
    @Busqueda     NVARCHAR(200) = NULL,
    @CategoriaID  INT = NULL,
    @PrecioMin    DECIMAL(10,2) = NULL,
    @PrecioMax    DECIMAL(10,2) = NULL,
    @SoloActivos  BIT = 1,
    @Pagina       INT = 1,
    @TamanoPagina INT = 12,
    @Orden        NVARCHAR(50) = 'fecha_desc'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Pagina - 1) * @TamanoPagina;

    SELECT p.*, c.Nombre AS CategoriaNombre,
           COUNT(*) OVER() AS TotalRegistros
    FROM dbo.Productos p
    INNER JOIN dbo.Categorias c ON p.CategoriaID = c.CategoriaID
    WHERE (@SoloActivos = 0 OR p.Activo = 1)
      AND (@CategoriaID IS NULL OR p.CategoriaID = @CategoriaID)
      AND (@Busqueda IS NULL OR p.Nombre LIKE '%' + @Busqueda + '%'
                             OR p.Descripcion LIKE '%' + @Busqueda + '%'
                             OR p.SKU LIKE '%' + @Busqueda + '%')
      AND (@PrecioMin IS NULL OR p.Precio >= @PrecioMin)
      AND (@PrecioMax IS NULL OR p.Precio <= @PrecioMax)
    ORDER BY
        CASE WHEN @Orden = 'precio_asc'  THEN p.Precio       END ASC,
        CASE WHEN @Orden = 'precio_desc' THEN p.Precio       END DESC,
        CASE WHEN @Orden = 'nombre'      THEN p.Nombre       END ASC,
        CASE WHEN @Orden = 'fecha_desc'  THEN p.FechaCreacion END DESC,
        p.ProductoID ASC
    OFFSET @Offset ROWS FETCH NEXT @TamanoPagina ROWS ONLY;
END
GO

-- SP: Actualizar stock al confirmar pedido
CREATE OR ALTER PROCEDURE dbo.sp_ActualizarStockPedido
    @PedidoID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE p
        SET p.Stock = p.Stock - d.Cantidad,
            p.TotalVendido = p.TotalVendido + d.Cantidad
        FROM dbo.Productos p
        INNER JOIN dbo.DetallePedidos d ON p.ProductoID = d.ProductoID
        WHERE d.PedidoID = @PedidoID;

        UPDATE dbo.Pedidos
        SET Estado = 'confirmado'
        WHERE PedidoID = @PedidoID;

        COMMIT TRANSACTION;
        PRINT 'Stock actualizado correctamente.';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP: Generar número de pedido único
CREATE OR ALTER PROCEDURE dbo.sp_GenerarNumeroPedido
    @NumeroPedido NVARCHAR(20) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Ultimo INT;
    SELECT @Ultimo = ISNULL(MAX(CAST(SUBSTRING(NumeroPedido,4,LEN(NumeroPedido)) AS INT)),0)
    FROM dbo.Pedidos;
    SET @NumeroPedido = 'LS-' + RIGHT('000000' + CAST(@Ultimo + 1 AS NVARCHAR), 6);
END
GO

-- ============================================================
--  VISTAS
-- ============================================================

-- Vista: Pedidos completos
CREATE OR ALTER VIEW dbo.vw_PedidosCompletos AS
SELECT
    p.PedidoID, p.NumeroPedido, p.Estado, p.MetodoPago, p.EstadoPago,
    p.Subtotal, p.Descuento, p.Envio, p.Total,
    p.FechaPedido, p.FechaEnvio, p.FechaEntrega,
    u.UsuarioID, u.Nombre + ' ' + u.Apellido AS NombreCompleto,
    u.Email,
    c.Codigo AS CodigoCupon
FROM dbo.Pedidos p
INNER JOIN dbo.Usuarios u ON p.UsuarioID = u.UsuarioID
LEFT  JOIN dbo.Cupones  c ON p.CuponID   = c.CuponID;
GO

-- Vista: Productos con calificación promedio
CREATE OR ALTER VIEW dbo.vw_ProductosCalificacion AS
SELECT
    p.ProductoID, p.Nombre, p.Precio, p.PrecioAnterior, p.Stock,
    p.ImagenPrincipal, p.Activo, p.Destacado, p.Badge, p.TotalVendido,
    c.Nombre AS Categoria,
    m.Nombre AS Marca,
    ISNULL(AVG(CAST(r.Calificacion AS DECIMAL(3,1))), 0) AS CalificacionPromedio,
    COUNT(r.ResenaID) AS TotalResenas
FROM dbo.Productos p
INNER JOIN dbo.Categorias c ON p.CategoriaID = c.CategoriaID
LEFT  JOIN dbo.Marcas     m ON p.MarcaID = m.MarcaID
LEFT  JOIN dbo.Resenas    r ON p.ProductoID = r.ProductoID AND r.Aprobada = 1
GROUP BY p.ProductoID, p.Nombre, p.Precio, p.PrecioAnterior, p.Stock,
         p.ImagenPrincipal, p.Activo, p.Destacado, p.Badge, p.TotalVendido,
         c.Nombre, m.Nombre;
GO

-- Vista: Resumen clientes
CREATE OR ALTER VIEW dbo.vw_ResumenClientes AS
SELECT
    u.UsuarioID, u.Nombre, u.Apellido, u.Email, u.Telefono,
    u.Activo, u.FechaCreacion, u.UltimoAcceso,
    COUNT(p.PedidoID)         AS TotalPedidos,
    ISNULL(SUM(p.Total), 0)   AS TotalGastado,
    MAX(p.FechaPedido)         AS UltimoPedido
FROM dbo.Usuarios u
LEFT JOIN dbo.Pedidos p ON u.UsuarioID = p.UsuarioID AND p.EstadoPago = 'pagado'
WHERE u.RolID = (SELECT RolID FROM dbo.Roles WHERE Nombre = 'cliente')
GROUP BY u.UsuarioID, u.Nombre, u.Apellido, u.Email, u.Telefono,
         u.Activo, u.FechaCreacion, u.UltimoAcceso;
GO

-- ============================================================
--  TRIGGERS
-- ============================================================

-- Trigger: Actualizar FechaActualizacion en Productos
CREATE OR ALTER TRIGGER dbo.trg_Productos_Update
ON dbo.Productos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Productos
    SET FechaActualizacion = GETDATE()
    WHERE ProductoID IN (SELECT ProductoID FROM inserted);
END
GO

-- Trigger: Actualizar FechaActualizacion en Usuarios
CREATE OR ALTER TRIGGER dbo.trg_Usuarios_Update
ON dbo.Usuarios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Usuarios
    SET FechaActualizacion = GETDATE()
    WHERE UsuarioID IN (SELECT UsuarioID FROM inserted);
END
GO

-- ============================================================
--  DATOS INICIALES (SEED)
-- ============================================================

-- Roles
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Nombre = 'admin')
    INSERT INTO dbo.Roles (Nombre, Descripcion) VALUES
    ('admin',   'Administrador con acceso total al sistema'),
    ('cliente', 'Cliente registrado con acceso a tienda y pedidos');
GO

-- Categorias
IF NOT EXISTS (SELECT 1 FROM dbo.Categorias WHERE Slug = 'ropa')
    INSERT INTO dbo.Categorias (Nombre, Slug, Descripcion, Orden) VALUES
    ('Ropa',        'ropa',        'Prendas de vestir',                1),
    ('Accesorios',  'accesorios',  'Bolsos, carteras y complementos',  2),
    ('Calzado',     'calzado',     'Zapatos, botas y sandalias',       3),
    ('Belleza',     'belleza',     'Perfumes, maquillaje y cuidado',   4);
GO

-- Marcas
IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE Nombre = 'LuxeOriginal')
    INSERT INTO dbo.Marcas (Nombre) VALUES
    ('LuxeOriginal'), ('ModaItalia'), ('UrbanEdge'), ('GlamParis');
GO

-- Usuarios: Admin + Cliente demo
-- NOTA: Los hashes de contraseña son solo ejemplos.
-- En producción usar bcrypt u otro algoritmo seguro.
-- Admin: admin@luxeshop.com / Admin123!
-- Cliente: cliente@email.com / Cliente123!
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = 'admin@luxeshop.com')
    INSERT INTO dbo.Usuarios (RolID, Nombre, Apellido, Email, PasswordHash, Activo, EmailVerificado)
    SELECT r.RolID, 'Super', 'Admin', 'admin@luxeshop.com',
           '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', -- sha256('admin')
           1, 1
    FROM dbo.Roles r WHERE r.Nombre = 'admin';
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = 'cliente@email.com')
    INSERT INTO dbo.Usuarios (RolID, Nombre, Apellido, Email, PasswordHash, Activo, EmailVerificado)
    SELECT r.RolID, 'María', 'González', 'cliente@email.com',
           '99c6b84c4a10fcf48c1a1c4e3a5d9f0d5d2e7a5b1c7d4e8f0a2b3c5d7e9f1a3b', -- hash demo
           1, 1
    FROM dbo.Roles r WHERE r.Nombre = 'cliente';
GO

-- Productos demo
IF NOT EXISTS (SELECT 1 FROM dbo.Productos WHERE SKU = 'ROP-001')
BEGIN
    DECLARE @CatRopa       INT = (SELECT CategoriaID FROM dbo.Categorias WHERE Slug='ropa');
    DECLARE @CatAcc        INT = (SELECT CategoriaID FROM dbo.Categorias WHERE Slug='accesorios');
    DECLARE @CatCalz       INT = (SELECT CategoriaID FROM dbo.Categorias WHERE Slug='calzado');
    DECLARE @CatBell       INT = (SELECT CategoriaID FROM dbo.Categorias WHERE Slug='belleza');
    DECLARE @Marca1        INT = (SELECT MarcaID FROM dbo.Marcas WHERE Nombre='LuxeOriginal');
    DECLARE @Marca2        INT = (SELECT MarcaID FROM dbo.Marcas WHERE Nombre='ModaItalia');

    INSERT INTO dbo.Productos (CategoriaID, MarcaID, Nombre, Slug, Precio, PrecioAnterior, Stock, StockMinimo, SKU, Badge, ImagenPrincipal, Destacado, Nuevo) VALUES
    (@CatRopa,  @Marca2, 'Chaqueta de Cuero Milano',    'chaqueta-cuero-milano',   289.99, 389.99, 5,  3, 'ROP-001', 'sale', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 1, 0),
    (@CatRopa,  @Marca2, 'Blazer Structured Wool',      'blazer-structured-wool',  320.00, NULL,   6,  3, 'ROP-002', 'new',  'https://images.unsplash.com/photo-1594938298603-c8148c4b4e62?w=400', 1, 1),
    (@CatRopa,  @Marca1, 'Gabardina London Rain',       'gabardina-london-rain',   445.00, 520.00, 4,  3, 'ROP-003', 'sale', 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400', 0, 0),
    (@CatAcc,  @Marca1, 'Bolso Tote Florentine',        'bolso-tote-florentine',   175.00, NULL,  12,  5, 'ACC-001', 'new',  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 1, 1),
    (@CatAcc,  @Marca2, 'Reloj Minimal Arc',            'reloj-minimal-arc',       215.00, 270.00, 3,  2, 'ACC-002', 'sale', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 1, 0),
    (@CatAcc,  @Marca1, 'Cartera Card Slim',            'cartera-card-slim',        55.00, NULL,  25,  8, 'ACC-003',  NULL,  'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 0, 0),
    (@CatCalz, @Marca2, 'Zapatillas Urbanas Édition',   'zapatillas-urbanas',      145.00, NULL,   8,  4, 'CAL-001', 'hot',  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 1, 0),
    (@CatCalz, @Marca1, 'Botines Chelsea Premium',      'botines-chelsea',         199.00, NULL,   9,  4, 'CAL-002', 'new',  'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400', 0, 1),
    (@CatCalz, @Marca2, 'Sandalias Ibiza Luxe',         'sandalias-ibiza-luxe',    110.00, 140.00, 7,  3, 'CAL-003', 'sale', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 0, 0),
    (@CatBell, @Marca1, 'Perfume Rose d Orient',        'perfume-rose-orient',      98.50, 130.00,20,  8, 'BEL-001', 'sale', 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', 1, 0),
    (@CatBell, @Marca2, 'Sérum Vitamin C Gold',         'serum-vitamin-c-gold',     62.00, NULL,  30, 10, 'BEL-002',  NULL,  'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400', 0, 0),
    (@CatBell, @Marca1, 'Paleta Sombras Velvet',        'paleta-sombras-velvet',    79.00, NULL,  18,  6, 'BEL-003', 'hot',  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400', 1, 0);

    PRINT 'Productos demo insertados.';
END
GO

-- Cupones
IF NOT EXISTS (SELECT 1 FROM dbo.Cupones WHERE Codigo = 'LUXE10')
    INSERT INTO dbo.Cupones (Codigo, Descripcion, Tipo, Valor, ValorMinimo, UsosMaximos, FechaFin) VALUES
    ('LUXE10',      '10% de descuento en toda la tienda',  'porcentaje', 10,  50.00, 500,  DATEADD(YEAR,1,GETDATE())),
    ('SAVE20',      '20% de descuento especial',           'porcentaje', 20, 100.00, 200,  DATEADD(YEAR,1,GETDATE())),
    ('FLAT15',      '$15 de descuento fijo',               'fijo',       15,  40.00, 300,  DATEADD(YEAR,1,GETDATE())),
    ('BIENVENIDO',  '5% para nuevos clientes',             'porcentaje',  5,   0.00, NULL, DATEADD(YEAR,2,GETDATE()));
GO

-- Configuracion del sistema
IF NOT EXISTS (SELECT 1 FROM dbo.Configuracion WHERE Clave = 'nombre_tienda')
    INSERT INTO dbo.Configuracion (Clave, Valor, Tipo, Descripcion) VALUES
    ('nombre_tienda',     'LUXE SHOP',            'texto',    'Nombre de la tienda'),
    ('email_contacto',    'info@luxeshop.com',     'texto',    'Email de contacto'),
    ('telefono',          '+591 700-00000',        'texto',    'Teléfono de contacto'),
    ('envio_gratis_desde','150.00',                'numero',   'Monto mínimo para envío gratis'),
    ('costo_envio',       '12.99',                 'numero',   'Costo de envío estándar'),
    ('impuesto_porcentaje','13',                   'numero',   'Porcentaje de impuesto (IVA)'),
    ('moneda',            'USD',                   'texto',    'Moneda principal'),
    ('mantenimiento',     'false',                 'booleano', 'Modo mantenimiento activo');
GO

-- ============================================================
--  ÍNDICES ADICIONALES PARA RENDIMIENTO
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DetallePedidos_PedidoID')
    CREATE INDEX IX_DetallePedidos_PedidoID  ON dbo.DetallePedidos(PedidoID);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_DetallePedidos_ProductoID')
    CREATE INDEX IX_DetallePedidos_ProductoID ON dbo.DetallePedidos(ProductoID);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Resenas_ProductoID')
    CREATE INDEX IX_Resenas_ProductoID ON dbo.Resenas(ProductoID);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Productos_Destacado')
    CREATE INDEX IX_Productos_Destacado ON dbo.Productos(Destacado) WHERE Destacado = 1;
GO

-- ============================================================
PRINT '========================================';
PRINT ' LuxeShopDB creada e inicializada OK.   ';
PRINT ' Ejecuta sp_DashboardResumen para       ';
PRINT ' verificar que todo funciona.           ';
PRINT '========================================';
GO

-- Verificar
EXEC dbo.sp_DashboardResumen;
GO
