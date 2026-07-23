inicializarDatos();
const sesion = protegerPagina("admin");

if (sesion) {
  document.getElementById("nombreUsuario").textContent = sesion.nombre;
}

const pestanaProductos = document.getElementById("pestanaProductos");
const pestanaUsuarios = document.getElementById("pestanaUsuarios");
const seccionProductos = document.getElementById("seccionProductos");
const seccionUsuarios = document.getElementById("seccionUsuarios");
const cuerpoTablaProductos = document.getElementById("cuerpoTablaProductos");
const cuerpoTablaUsuarios = document.getElementById("cuerpoTablaUsuarios");
const buscadorProductos = document.getElementById("buscadorProductos");

const fondoModal = document.getElementById("fondoModal");
const formularioProducto = document.getElementById("formularioProducto");
const tituloModal = document.getElementById("tituloModal");

function obtenerInicial(nombre) {
  return nombre.trim().charAt(0).toUpperCase();
}

pestanaProductos.addEventListener("click", () => {
  pestanaProductos.classList.add("activa");
  pestanaUsuarios.classList.remove("activa");
  seccionProductos.classList.remove("oculto");
  seccionUsuarios.classList.add("oculto");
});

pestanaUsuarios.addEventListener("click", () => {
  pestanaUsuarios.classList.add("activa");
  pestanaProductos.classList.remove("activa");
  seccionUsuarios.classList.remove("oculto");
  seccionProductos.classList.add("oculto");
  renderizarUsuarios();
});

function renderizarProductos() {
  const productos = obtenerProductos();
  const texto = buscadorProductos.value.trim().toLowerCase();
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(texto)
  );

  if (productosFiltrados.length === 0) {
    cuerpoTablaProductos.innerHTML =
      '<tr><td colspan="6"><div class="estado-vacio">No hay productos que coincidan</div></td></tr>';
    return;
  }

  cuerpoTablaProductos.innerHTML = productosFiltrados
    .map(
      (producto) => `
        <tr>
          <td><div class="celda-imagen-tabla">${obtenerInicial(producto.nombre)}</div></td>
          <td>${producto.nombre}</td>
          <td>${producto.categoria}</td>
          <td>${formatearPrecio(producto.precio)}</td>
          <td>${producto.stock}</td>
          <td>
            <div class="acciones-tabla">
              <button class="boton boton-secundario boton-pequeno" data-accion="editar" data-id="${producto.id}">
                Editar
              </button>
              <button class="boton boton-peligro boton-pequeno" data-accion="eliminar" data-id="${producto.id}">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  cuerpoTablaProductos.querySelectorAll("button[data-accion]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const idProducto = boton.dataset.id;
      if (boton.dataset.accion === "editar") {
        abrirModalEdicion(idProducto);
      } else {
        eliminarProducto(idProducto);
      }
    });
  });
}

function abrirModalNuevo() {
  formularioProducto.reset();
  document.getElementById("productoId").value = "";
  tituloModal.textContent = "Nuevo producto";
  fondoModal.classList.remove("oculto");
}

function abrirModalEdicion(idProducto) {
  const productos = obtenerProductos();
  const producto = productos.find((item) => item.id === idProducto);
  if (!producto) {
    return;
  }

  document.getElementById("productoId").value = producto.id;
  document.getElementById("productoNombre").value = producto.nombre;
  document.getElementById("productoDescripcion").value = producto.descripcion;
  document.getElementById("productoCategoria").value = producto.categoria;
  document.getElementById("productoPrecio").value = producto.precio;
  document.getElementById("productoStock").value = producto.stock;

  tituloModal.textContent = "Editar producto";
  fondoModal.classList.remove("oculto");
}

function cerrarModal() {
  fondoModal.classList.add("oculto");
  formularioProducto.reset();
}

function eliminarProducto(idProducto) {
  const confirmado = window.confirm("Deseas eliminar este producto?");
  if (!confirmado) {
    return;
  }

  const productos = obtenerProductos().filter((producto) => producto.id !== idProducto);
  guardarProductos(productos);
  mostrarNotificacion("Producto eliminado");
  renderizarProductos();
}

formularioProducto.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const idProducto = document.getElementById("productoId").value;
  const datosProducto = {
    nombre: document.getElementById("productoNombre").value.trim(),
    descripcion: document.getElementById("productoDescripcion").value.trim(),
    categoria: document.getElementById("productoCategoria").value.trim(),
    precio: Number(document.getElementById("productoPrecio").value),
    stock: Number(document.getElementById("productoStock").value),
  };

  const productos = obtenerProductos();

  if (idProducto) {
    const producto = productos.find((item) => item.id === idProducto);
    Object.assign(producto, datosProducto);
    mostrarNotificacion("Producto actualizado");
  } else {
    productos.push({ id: generarId(), ...datosProducto });
    mostrarNotificacion("Producto creado");
  }

  guardarProductos(productos);
  cerrarModal();
  renderizarProductos();
});

function renderizarUsuarios() {
  const usuarios = obtenerUsuarios();

  cuerpoTablaUsuarios.innerHTML = usuarios
    .map(
      (usuario) => `
        <tr>
          <td>${usuario.nombre}</td>
          <td>${usuario.email}</td>
          <td>
            <span class="insignia ${usuario.rol === "admin" ? "insignia-admin" : "insignia-cliente"}">
              ${usuario.rol === "admin" ? "Administrador" : "Cliente"}
            </span>
          </td>
          <td>
            ${
              usuario.id === sesion.id
                ? ""
                : `<button class="boton boton-peligro boton-pequeno" data-id="${usuario.id}">Eliminar</button>`
            }
          </td>
        </tr>
      `
    )
    .join("");

  cuerpoTablaUsuarios.querySelectorAll("button[data-id]").forEach((boton) => {
    boton.addEventListener("click", () => eliminarUsuario(boton.dataset.id));
  });
}

function eliminarUsuario(idUsuario) {
  const confirmado = window.confirm("Deseas eliminar este usuario?");
  if (!confirmado) {
    return;
  }

  const usuarios = obtenerUsuarios().filter((usuario) => usuario.id !== idUsuario);
  guardarUsuarios(usuarios);
  mostrarNotificacion("Usuario eliminado");
  renderizarUsuarios();
}

buscadorProductos.addEventListener("input", renderizarProductos);
document.getElementById("botonNuevoProducto").addEventListener("click", abrirModalNuevo);
document.getElementById("botonCerrarModal").addEventListener("click", cerrarModal);
document.getElementById("botonCancelarModal").addEventListener("click", cerrarModal);
fondoModal.addEventListener("click", (evento) => {
  if (evento.target === fondoModal) {
    cerrarModal();
  }
});
document.getElementById("botonCerrarSesion").addEventListener("click", cerrarSesion);

renderizarProductos();
