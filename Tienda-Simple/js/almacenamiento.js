function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function inicializarDatos() {
  if (!localStorage.getItem("usuarios")) {
    const usuarios = [
      {
        id: generarId(),
        nombre: "Administrador",
        email: "admin@tienda.com",
        password: "admin123",
        rol: "admin",
      },
    ];
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  if (!localStorage.getItem("productos")) {
    const productos = [
      {
        id: generarId(),
        nombre: "Taza de ceramica",
        descripcion: "Taza artesanal de ceramica blanca de 300ml",
        precio: 45,
        categoria: "Hogar",
        stock: 18,
      },
      {
        id: generarId(),
        nombre: "Cuaderno rayado",
        descripcion: "Cuaderno de 100 hojas con tapa de tela",
        precio: 28,
        categoria: "Papeleria",
        stock: 30,
      },
      {
        id: generarId(),
        nombre: "Lampara de mesa",
        descripcion: "Lampara minimalista con base de madera",
        precio: 160,
        categoria: "Hogar",
        stock: 6,
      },
      {
        id: generarId(),
        nombre: "Mochila de lona",
        descripcion: "Mochila resistente de lona color arena",
        precio: 210,
        categoria: "Accesorios",
        stock: 12,
      },
      {
        id: generarId(),
        nombre: "Set de lapices",
        descripcion: "Set de 12 lapices de grafito profesional",
        precio: 32,
        categoria: "Papeleria",
        stock: 40,
      },
      {
        id: generarId(),
        nombre: "Maceta de barro",
        descripcion: "Maceta pequena de barro para plantas de interior",
        precio: 38,
        categoria: "Hogar",
        stock: 3,
      },
    ];
    localStorage.setItem("productos", JSON.stringify(productos));
  }
}

function obtenerUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function obtenerProductos() {
  return JSON.parse(localStorage.getItem("productos")) || [];
}

function guardarProductos(productos) {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function obtenerSesion() {
  return JSON.parse(localStorage.getItem("sesion"));
}

function guardarSesion(sesion) {
  localStorage.setItem("sesion", JSON.stringify(sesion));
}

function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "index.html";
}

function obtenerCarrito(usuarioId) {
  return JSON.parse(localStorage.getItem("carrito_" + usuarioId)) || [];
}

function guardarCarrito(usuarioId, carrito) {
  localStorage.setItem("carrito_" + usuarioId, JSON.stringify(carrito));
}

function protegerPagina(rolRequerido) {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.href = "index.html";
    return null;
  }
  if (rolRequerido && sesion.rol !== rolRequerido) {
    window.location.href = sesion.rol === "admin" ? "admin.html" : "tienda.html";
    return null;
  }
  return sesion;
}

function mostrarNotificacion(texto) {
  const existente = document.querySelector(".notificacion");
  if (existente) {
    existente.remove();
  }
  const aviso = document.createElement("div");
  aviso.className = "notificacion";
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  requestAnimationFrame(() => {
    aviso.classList.add("visible");
  });
  setTimeout(() => {
    aviso.classList.remove("visible");
    setTimeout(() => aviso.remove(), 200);
  }, 2200);
}

function formatearPrecio(numero) {
  return "$" + Number(numero).toFixed(2);
}
