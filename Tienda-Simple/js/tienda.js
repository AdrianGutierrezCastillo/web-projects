inicializarDatos();
const sesion = protegerPagina("cliente");

if (sesion) {
  document.getElementById("nombreUsuario").textContent = sesion.nombre;
}

const cuadriculaProductos = document.getElementById("cuadriculaProductos");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtroCategoria");
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");

function cargarCategorias() {
  const productos = obtenerProductos();
  const categorias = [...new Set(productos.map((producto) => producto.categoria))];
  filtroCategoria.innerHTML = '<option value="">Todas las categorias</option>';
  categorias.forEach((categoria) => {
    const opcion = document.createElement("option");
    opcion.value = categoria;
    opcion.textContent = categoria;
    filtroCategoria.appendChild(opcion);
  });
}

function obtenerInicial(nombre) {
  return nombre.trim().charAt(0).toUpperCase();
}

function renderizarProductos() {
  const productos = obtenerProductos();
  const textoBusqueda = buscador.value.trim().toLowerCase();
  const categoriaSeleccionada = filtroCategoria.value;

  const productosFiltrados = productos.filter((producto) => {
    const coincideTexto = producto.nombre.toLowerCase().includes(textoBusqueda);
    const coincideCategoria = !categoriaSeleccionada || producto.categoria === categoriaSeleccionada;
    return coincideTexto && coincideCategoria;
  });

  if (productosFiltrados.length === 0) {
    cuadriculaProductos.innerHTML = '<div class="estado-vacio">No se encontraron productos</div>';
    return;
  }

  cuadriculaProductos.innerHTML = productosFiltrados
    .map((producto) => {
      const sinStock = producto.stock <= 0;
      const stockBajo = producto.stock > 0 && producto.stock <= 5;
      return `
        <div class="tarjeta tarjeta-producto">
          <div class="imagen-producto">${obtenerInicial(producto.nombre)}</div>
          <div class="info-producto">
            <span class="categoria-producto">${producto.categoria}</span>
            <p class="nombre-producto">${producto.nombre}</p>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="pie-producto">
              <span class="precio-producto">${formatearPrecio(producto.precio)}</span>
              <span class="existencia-producto ${stockBajo ? "existencia-baja" : ""}">
                ${sinStock ? "Sin stock" : producto.stock + " disponibles"}
              </span>
            </div>
            <button
              class="boton boton-primario boton-ancho boton-pequeno"
              data-id="${producto.id}"
              ${sinStock ? "disabled" : ""}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  cuadriculaProductos.querySelectorAll("button[data-id]").forEach((boton) => {
    boton.addEventListener("click", () => agregarAlCarrito(boton.dataset.id));
  });
}

function agregarAlCarrito(idProducto) {
  const productos = obtenerProductos();
  const producto = productos.find((item) => item.id === idProducto);
  if (!producto || producto.stock <= 0) {
    return;
  }

  const carrito = obtenerCarrito(sesion.id);
  const itemExistente = carrito.find((item) => item.productoId === idProducto);

  if (itemExistente) {
    if (itemExistente.cantidad >= producto.stock) {
      mostrarNotificacion("No hay mas stock disponible");
      return;
    }
    itemExistente.cantidad += 1;
  } else {
    carrito.push({ productoId: idProducto, cantidad: 1 });
  }

  guardarCarrito(sesion.id, carrito);
  mostrarNotificacion(producto.nombre + " agregado al carrito");
  renderizarCarrito();
}

function cambiarCantidad(idProducto, cambio) {
  const productos = obtenerProductos();
  const producto = productos.find((item) => item.id === idProducto);
  const carrito = obtenerCarrito(sesion.id);
  const item = carrito.find((itemCarrito) => itemCarrito.productoId === idProducto);

  if (!item) {
    return;
  }

  const nuevaCantidad = item.cantidad + cambio;

  if (nuevaCantidad <= 0) {
    const carritoActualizado = carrito.filter((itemCarrito) => itemCarrito.productoId !== idProducto);
    guardarCarrito(sesion.id, carritoActualizado);
  } else if (producto && nuevaCantidad <= producto.stock) {
    item.cantidad = nuevaCantidad;
    guardarCarrito(sesion.id, carrito);
  }

  renderizarCarrito();
}

function quitarDelCarrito(idProducto) {
  const carrito = obtenerCarrito(sesion.id);
  const carritoActualizado = carrito.filter((item) => item.productoId !== idProducto);
  guardarCarrito(sesion.id, carritoActualizado);
  renderizarCarrito();
}

function renderizarCarrito() {
  const carrito = obtenerCarrito(sesion.id);
  const productos = obtenerProductos();

  const itemsConDatos = carrito
    .map((item) => {
      const producto = productos.find((productoItem) => productoItem.id === item.productoId);
      return producto ? { ...item, producto } : null;
    })
    .filter(Boolean);

  const totalItems = itemsConDatos.reduce((total, item) => total + item.cantidad, 0);
  contadorCarrito.textContent = totalItems;
  contadorCarrito.classList.toggle("oculto", totalItems === 0);

  if (itemsConDatos.length === 0) {
    listaCarrito.innerHTML = '<div class="estado-vacio">Tu carrito esta vacio</div>';
  } else {
    listaCarrito.innerHTML = itemsConDatos
      .map(
        (item) => `
          <div class="fila-carrito">
            <div class="miniatura-carrito">${obtenerInicial(item.producto.nombre)}</div>
            <div class="detalle-fila-carrito">
              <p class="nombre-fila-carrito">${item.producto.nombre}</p>
              <p>${formatearPrecio(item.producto.precio)}</p>
              <div class="control-cantidad">
                <button data-accion="restar" data-id="${item.productoId}">-</button>
                <span>${item.cantidad}</span>
                <button data-accion="sumar" data-id="${item.productoId}">+</button>
                <button class="quitar-item" data-accion="quitar" data-id="${item.productoId}">Quitar</button>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  }

  const total = itemsConDatos.reduce((suma, item) => suma + item.cantidad * item.producto.precio, 0);
  totalCarrito.textContent = formatearPrecio(total);

  listaCarrito.querySelectorAll("button[data-accion]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const accion = boton.dataset.accion;
      const idProducto = boton.dataset.id;
      if (accion === "sumar") {
        cambiarCantidad(idProducto, 1);
      } else if (accion === "restar") {
        cambiarCantidad(idProducto, -1);
      } else if (accion === "quitar") {
        quitarDelCarrito(idProducto);
      }
    });
  });
}

function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  fondoCarrito.classList.remove("oculto");
}

function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  fondoCarrito.classList.add("oculto");
}

function finalizarCompra() {
  const carrito = obtenerCarrito(sesion.id);
  if (carrito.length === 0) {
    return;
  }

  const productos = obtenerProductos();
  let stockSuficiente = true;

  carrito.forEach((item) => {
    const producto = productos.find((productoItem) => productoItem.id === item.productoId);
    if (!producto || producto.stock < item.cantidad) {
      stockSuficiente = false;
    }
  });

  if (!stockSuficiente) {
    mostrarNotificacion("Algunos productos ya no tienen stock suficiente");
    renderizarProductos();
    renderizarCarrito();
    return;
  }

  carrito.forEach((item) => {
    const producto = productos.find((productoItem) => productoItem.id === item.productoId);
    producto.stock -= item.cantidad;
  });

  guardarProductos(productos);
  guardarCarrito(sesion.id, []);
  mostrarNotificacion("Compra realizada con exito");
  cerrarCarrito();
  renderizarProductos();
  renderizarCarrito();
}

buscador.addEventListener("input", renderizarProductos);
filtroCategoria.addEventListener("change", renderizarProductos);
document.getElementById("botonAbrirCarrito").addEventListener("click", abrirCarrito);
document.getElementById("botonCerrarCarrito").addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);
document.getElementById("botonFinalizarCompra").addEventListener("click", finalizarCompra);
document.getElementById("botonCerrarSesion").addEventListener("click", cerrarSesion);

cargarCategorias();
renderizarProductos();
renderizarCarrito();
