inicializarDatos();

const sesionActiva = obtenerSesion();
if (sesionActiva) {
  window.location.href = sesionActiva.rol === "admin" ? "admin.html" : "tienda.html";
}

const pestanaLogin = document.getElementById("pestanaLogin");
const pestanaRegistro = document.getElementById("pestanaRegistro");
const formularioLogin = document.getElementById("formularioLogin");
const formularioRegistro = document.getElementById("formularioRegistro");
const errorMensaje = document.getElementById("errorMensaje");

function mostrarError(texto) {
  errorMensaje.textContent = texto;
  errorMensaje.classList.remove("oculto");
}

function limpiarError() {
  errorMensaje.classList.add("oculto");
  errorMensaje.textContent = "";
}

pestanaLogin.addEventListener("click", () => {
  pestanaLogin.classList.add("activa");
  pestanaRegistro.classList.remove("activa");
  formularioLogin.classList.remove("oculto");
  formularioRegistro.classList.add("oculto");
  limpiarError();
});

pestanaRegistro.addEventListener("click", () => {
  pestanaRegistro.classList.add("activa");
  pestanaLogin.classList.remove("activa");
  formularioRegistro.classList.remove("oculto");
  formularioLogin.classList.add("oculto");
  limpiarError();
});

formularioLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarError();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  const usuarios = obtenerUsuarios();
  const usuarioEncontrado = usuarios.find(
    (usuario) => usuario.email.toLowerCase() === email && usuario.password === password
  );

  if (!usuarioEncontrado) {
    mostrarError("Correo o contrasena incorrectos");
    return;
  }

  guardarSesion({
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    email: usuarioEncontrado.email,
    rol: usuarioEncontrado.rol,
  });

  window.location.href = usuarioEncontrado.rol === "admin" ? "admin.html" : "tienda.html";
});

formularioRegistro.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarError();

  const nombre = document.getElementById("registroNombre").value.trim();
  const email = document.getElementById("registroEmail").value.trim().toLowerCase();
  const password = document.getElementById("registroPassword").value;

  const usuarios = obtenerUsuarios();
  const yaExiste = usuarios.some((usuario) => usuario.email.toLowerCase() === email);

  if (yaExiste) {
    mostrarError("Ya existe una cuenta con ese correo");
    return;
  }

  const nuevoUsuario = {
    id: generarId(),
    nombre: nombre,
    email: email,
    password: password,
    rol: "cliente",
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  guardarSesion({
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    email: nuevoUsuario.email,
    rol: nuevoUsuario.rol,
  });

  window.location.href = "tienda.html";
});
