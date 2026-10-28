// elementos.js
// Sección "Elementos registrados" de Traslado.html: buscar, modificar y eliminar
// los elementos de los traslados (biológico, no biológico y órgano).
//
// Cada traslado guarda su propio elemento, así que puede haber varios con el mismo nombre.
// Por eso la búsqueda trae TODOS los que coinciden: si hay uno solo se carga directo,
// y si hay varios aparece una lista para elegir cuál (cada uno dice a qué traslado pertenece).

// Texto que dice a qué traslado pertenece un elemento
function textoTraslado(dato) {
  if (dato.id_traslado) {
    return t('Traslado Nº') + ' ' + dato.id_traslado;
  }
  return t('Sin traslado');
}


// ==================== BIOLÓGICO ====================

const id_biologico = document.getElementById('id_biologico');
const nombre = document.getElementById('nombre');
const estado = document.getElementById('estado');
const formBiologico = document.getElementById('form_biologico');

const buscar = document.getElementById('buscar');
const buscar_boton = document.getElementById('buscar_boton');
const resultados_b = document.getElementById('resultados_b');

// Acá quedan los resultados de la última búsqueda
let encontrados_b = [];

// Pone los datos de un insumo en el formulario de modificar
function cargarBiologico(dato) {
  id_biologico.value = dato.id;
  nombre.value = dato.nombre;
  estado.value = dato.estado;
}

// Deja todo como al principio (sin insumo elegido)
function limpiarBiologico() {
  formBiologico.reset();
  id_biologico.value = '';
  resultados_b.hidden = true;
}

buscar_boton.addEventListener('click', async (e) => {
  e.preventDefault();

  const datosBusqueda = new FormData();
  datosBusqueda.append('nombre', buscar.value);

  const respuesta = await fetch('../php/buscar_Ingresar.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  limpiarBiologico();

  if (!resultado.exito) {
    alert(t(resultado.mensaje || 'No se encontró el insumo.'));
    return;
  }

  document.getElementById('form_buscar').reset();
  encontrados_b = resultado.datos;

  if (encontrados_b.length === 1) {
    cargarBiologico(encontrados_b[0]);
  } else {
    // Hay varios: se arma la lista para elegir. El "value" de cada opción es su posición en la lista
    resultados_b.innerHTML = '';
    resultados_b.add(new Option(t('Hay varios resultados: elegí uno'), ''));

    for (let i = 0; i < encontrados_b.length; i++) {
      const texto = textoTraslado(encontrados_b[i]) + ' - ' + encontrados_b[i].nombre;
      resultados_b.add(new Option(texto, i));
    }

    resultados_b.hidden = false;
  }
});

// Al elegir uno de la lista, se carga en el formulario
resultados_b.addEventListener('change', () => {
  if (resultados_b.value !== '') {
    cargarBiologico(encontrados_b[Number(resultados_b.value)]);
  }
});

const mod_b = document.getElementById('mod_b');

mod_b.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés modificar.'));
    return;
  }

  const datosModificar = new FormData();
  datosModificar.append('id', id_biologico.value);
  datosModificar.append('nombre', nombre.value);
  datosModificar.append('estado', estado.value);

  const respuesta = await fetch('../php/modificar_biologico.php', {
    method: 'POST',
    body: datosModificar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Elemento modificado correctamente'));
    limpiarBiologico();
  } else {
    alert(t(resultado.mensaje || 'Error al realizar la modificación'));
  }
});

const del_b = document.getElementById('del_b');

del_b.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés eliminar.'));
    return;
  }

  // El elemento y su traslado se borran juntos (si no, el traslado quedaría sin elemento)
  if (!confirm(t('¿Seguro que querés eliminar este insumo? También se va a eliminar su traslado.'))) {
    return;
  }

  const datosEliminar = new FormData();
  datosEliminar.append('id', id_biologico.value);

  const respuesta = await fetch('../php/eliminar_biologico.php', {
    method: 'POST',
    body: datosEliminar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Insumo eliminado correctamente'));
    limpiarBiologico();
    // Si el traslado estaba en curso, su ambulancia quedó libre: se actualiza la lista de ambulancias
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el insumo'));
  }
});


// ==================== NO BIOLÓGICO ====================

const id_no_biologico = document.getElementById('id_no_biologico');
const clasificacion = document.getElementById('clasificacion');
const pendiente = document.getElementById('pendiente');
const formNoBiologico = document.getElementById('form_no_biologico');

const encontrar = document.getElementById('encontrar');
const buscar_boton_no = document.getElementById('buscar_boton_nobiologico');
const resultados_no = document.getElementById('resultados_no');

let encontrados_no = [];

function cargarNoBiologico(dato) {
  id_no_biologico.value = dato.id;
  clasificacion.value = dato.clasificacion;
  pendiente.value = dato.pendiente;
}

function limpiarNoBiologico() {
  formNoBiologico.reset();
  id_no_biologico.value = '';
  resultados_no.hidden = true;
}

buscar_boton_no.addEventListener('click', async (e) => {
  e.preventDefault();

  const datosBusqueda = new FormData();
  datosBusqueda.append('clasificacion', encontrar.value);

  const respuesta = await fetch('../php/buscar_noBiologico.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  limpiarNoBiologico();

  if (!resultado.exito) {
    alert(t(resultado.mensaje || 'No se encontró el insumo.'));
    return;
  }

  document.getElementById('form_noB').reset();
  encontrados_no = resultado.datos;

  if (encontrados_no.length === 1) {
    cargarNoBiologico(encontrados_no[0]);
  } else {
    resultados_no.innerHTML = '';
    resultados_no.add(new Option(t('Hay varios resultados: elegí uno'), ''));

    for (let i = 0; i < encontrados_no.length; i++) {
      const texto = textoTraslado(encontrados_no[i]) + ' - ' + encontrados_no[i].clasificacion;
      resultados_no.add(new Option(texto, i));
    }

    resultados_no.hidden = false;
  }
});

resultados_no.addEventListener('change', () => {
  if (resultados_no.value !== '') {
    cargarNoBiologico(encontrados_no[Number(resultados_no.value)]);
  }
});

const mod_no = document.getElementById('mod_no');

mod_no.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_no_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés modificar.'));
    return;
  }

  const datosModificar = new FormData();
  datosModificar.append('id', id_no_biologico.value);
  datosModificar.append('clasificacion', clasificacion.value);
  datosModificar.append('pendiente', pendiente.value);

  const respuesta = await fetch('../php/modificar_noBiologico.php', {
    method: 'POST',
    body: datosModificar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Elemento modificado correctamente'));
    limpiarNoBiologico();
  } else {
    alert(t(resultado.mensaje || 'Error al realizar la modificación'));
  }
});

const del_no = document.getElementById('del_no');

del_no.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_no_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés eliminar.'));
    return;
  }

  if (!confirm(t('¿Seguro que querés eliminar este insumo? También se va a eliminar su traslado.'))) {
    return;
  }

  const datosEliminar = new FormData();
  datosEliminar.append('id', id_no_biologico.value);

  const respuesta = await fetch('../php/eliminar_noBiologico.php', {
    method: 'POST',
    body: datosEliminar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Insumo eliminado correctamente'));
    limpiarNoBiologico();
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el insumo'));
  }
});


// ==================== ÓRGANO ====================

const id_organo = document.getElementById('id_organo');
const persona = document.getElementById('persona');
const en_curso = document.getElementById('en_curso');
const formOrgano = document.getElementById('form_organo');

const encontrar_organo = document.getElementById('encontrar_org');
const buscar_boton_organo = document.getElementById('button_org');
const resultados_org = document.getElementById('resultados_org');

let encontrados_org = [];

function cargarOrgano(dato) {
  id_organo.value = dato.id;
  persona.value = dato.persona;
  en_curso.value = dato.en_curso;
}

function limpiarOrgano() {
  formOrgano.reset();
  id_organo.value = '';
  resultados_org.hidden = true;
}

buscar_boton_organo.addEventListener('click', async (e) => {
  e.preventDefault();

  const datosBusqueda = new FormData();
  datosBusqueda.append('persona', encontrar_organo.value);

  const respuesta = await fetch('../php/buscar_organo.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  limpiarOrgano();

  if (!resultado.exito) {
    alert(t(resultado.mensaje || 'No se encontró el registro.'));
    return;
  }

  document.getElementById('form_org').reset();
  encontrados_org = resultado.datos;

  if (encontrados_org.length === 1) {
    cargarOrgano(encontrados_org[0]);
  } else {
    resultados_org.innerHTML = '';
    resultados_org.add(new Option(t('Hay varios resultados: elegí uno'), ''));

    for (let i = 0; i < encontrados_org.length; i++) {
      const texto = textoTraslado(encontrados_org[i]) + ' - ' + encontrados_org[i].persona;
      resultados_org.add(new Option(texto, i));
    }

    resultados_org.hidden = false;
  }
});

resultados_org.addEventListener('change', () => {
  if (resultados_org.value !== '') {
    cargarOrgano(encontrados_org[Number(resultados_org.value)]);
  }
});

const mod_org = document.getElementById('mod_org');

mod_org.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_organo.value === '') {
    alert(t('Primero buscá el registro que querés modificar.'));
    return;
  }

  const datosModificar = new FormData();
  datosModificar.append('id', id_organo.value);
  datosModificar.append('persona', persona.value);
  datosModificar.append('en_curso', en_curso.value);

  const respuesta = await fetch('../php/modificar_organo.php', {
    method: 'POST',
    body: datosModificar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Registro modificado correctamente'));
    limpiarOrgano();
  } else {
    alert(t(resultado.mensaje || 'Error al realizar la modificación'));
  }
});

const del_org = document.getElementById('del_org');

del_org.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_organo.value === '') {
    alert(t('Primero buscá el registro que querés eliminar.'));
    return;
  }

  if (!confirm(t('¿Seguro que querés eliminar este registro? También se va a eliminar su traslado.'))) {
    return;
  }

  const datosEliminar = new FormData();
  datosEliminar.append('id', id_organo.value);

  const respuesta = await fetch('../php/eliminar_organo.php', {
    method: 'POST',
    body: datosEliminar
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert(t('Registro eliminado correctamente'));
    limpiarOrgano();
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el registro'));
  }
});
