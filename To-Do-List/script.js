let tareas = [
  { id: 1, texto: "Configurar el proyecto", completada: true },
  { id: 2, texto: "Revisar el diseño", completada: false },
];

let siguienteId = 3;

const lista = document.getElementById('lista-tareas');
const input = document.getElementById('input-tarea');
const btnAgregar = document.getElementById('btn-agregar');
const mensajeVacio = document.getElementById('vacio');
const contador = document.getElementById('contador');

function renderizar(){
  lista.innerHTML = '';

  mensajeVacio.style.display = tareas.length === 0 ? 'block' : 'none';

  tareas.forEach(function(tarea){
    const li = document.createElement('li');
    li.className = 'tarea clay' + (tarea.completada ? ' completada' : '');

    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox ' + (tarea.completada ? 'clay marcado' : 'clay-inset');
    checkbox.textContent = tarea.completada ? '✓' : '';
    checkbox.addEventListener('click', function(){
      alternarCompletada(tarea.id);
    });

    const texto = document.createElement('span');
    texto.className = 'texto-tarea';
    texto.textContent = tarea.texto;
    texto.contentEditable = 'false';

    texto.addEventListener('dblclick', function(){
      texto.contentEditable = 'true';
      texto.focus();
    });

    texto.addEventListener('blur', function(){
      texto.contentEditable = 'false';
      editarTexto(tarea.id, texto.textContent);
    });

    texto.addEventListener('keydown', function(evento){
      if (evento.key === 'Enter'){
        evento.preventDefault();
        texto.blur();
      }
    });

    const acciones = document.createElement('div');
    acciones.className = 'acciones';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-icono editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', function(){
      texto.contentEditable = 'true';
      texto.focus();
    });

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn-icono eliminar';
    btnEliminar.textContent = 'Borrar';
    btnEliminar.addEventListener('click', function(){
      eliminarTarea(tarea.id);
    });

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(acciones);
    lista.appendChild(li);
  });

  const completadas = tareas.filter(function(t){ return t.completada; }).length;
  contador.textContent = tareas.length === 0
    ? ''
    : completadas + ' de ' + tareas.length + ' completadas';
}

function agregarTarea(){
  const texto = input.value.trim();
  if (texto === '') return;

  tareas.push({ id: siguienteId, texto: texto, completada: false });
  siguienteId++;
  input.value = '';
  renderizar();
}

function alternarCompletada(id){
  tareas = tareas.map(function(tarea){
    if (tarea.id === id){
      tarea.completada = !tarea.completada;
    }
    return tarea;
  });
  renderizar();
}

function editarTexto(id, nuevoTexto){
  nuevoTexto = nuevoTexto.trim();

  if (nuevoTexto === ''){
    eliminarTarea(id);
    return;
  }

  tareas = tareas.map(function(tarea){
    if (tarea.id === id){
      tarea.texto = nuevoTexto;
    }
    return tarea;
  });
  renderizar();
}

function eliminarTarea(id){
  tareas = tareas.filter(function(tarea){
    return tarea.id !== id;
  });
  renderizar();
}

btnAgregar.addEventListener('click', agregarTarea);

input.addEventListener('keydown', function(evento){
  if (evento.key === 'Enter'){
    agregarTarea();
  }
});

renderizar();
