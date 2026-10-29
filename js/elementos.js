
function textoTraslado(dato) {
  if (dato.id_traslado) {
    return t('Traslado Nº') + ' ' + dato.id_traslado;
  }
  return t('Sin traslado');
}

async function enviar(url, campos) {
  const datos = new FormData();

  for (const nombreCampo in campos) {
    datos.append(nombreCampo, campos[nombreCampo]);
  }

  const respuesta = await fetch(url, {
    method: 'POST',
    body: datos
  });
  return respuesta.json();
}

function mostrarVarios(lista, encontrados, campo) {
  lista.innerHTML = '';
  lista.add(new Option(t('Hay varios resultados: elegí uno'), ''));

  for (let i = 0; i < encontrados.length; i++) {
    const texto = textoTraslado(encontrados[i]) + ' - ' + encontrados[i][campo];
    lista.add(new Option(texto, i));
  }

  lista.hidden = false;
}



const id_biologico = document.getElementById('id_biologico');
const nombre = document.getElementById('nombre');
const estado = document.getElementById('estado');
const formBiologico = document.getElementById('form_biologico');

const buscar = document.getElementById('buscar');
const buscar_boton = document.getElementById('buscar_boton');
const resultados_b = document.getElementById('resultados_b');

let encontrados_b = [];

function cargarBiologico(dato) {
  id_biologico.value = dato.id;
  nombre.value = dato.nombre;
  estado.value = dato.estado;
}

function limpiarBiologico() {
  formBiologico.reset();
  id_biologico.value = '';
  resultados_b.hidden = true;
}

buscar_boton.addEventListener('click', async (e) => {
  e.preventDefault();

  const resultado = await enviar('../php/buscar_Ingresar.php', { nombre: buscar.value });

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
    mostrarVarios(resultados_b, encontrados_b, 'nombre');
  }
});

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

  const resultado = await enviar('../php/modificar_biologico.php', {
    id: id_biologico.value,
    nombre: nombre.value,
    estado: estado.value
  });

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

  if (!confirm(t('¿Seguro que querés eliminar este insumo? También se va a eliminar su traslado.'))) {
    return;
  }

  const resultado = await enviar('../php/eliminar_biologico.php', { id: id_biologico.value });

  if (resultado.exito) {
    alert(t('Insumo eliminado correctamente'));
    limpiarBiologico();
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el insumo'));
  }
});



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

  const resultado = await enviar('../php/buscar_noBiologico.php', { clasificacion: encontrar.value });

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
    mostrarVarios(resultados_no, encontrados_no, 'clasificacion');
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

  const resultado = await enviar('../php/modificar_noBiologico.php', {
    id: id_no_biologico.value,
    clasificacion: clasificacion.value,
    pendiente: pendiente.value
  });

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

  const resultado = await enviar('../php/eliminar_noBiologico.php', { id: id_no_biologico.value });

  if (resultado.exito) {
    alert(t('Insumo eliminado correctamente'));
    limpiarNoBiologico();
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el insumo'));
  }
});



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

  const resultado = await enviar('../php/buscar_organo.php', { persona: encontrar_organo.value });

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
    mostrarVarios(resultados_org, encontrados_org, 'persona');
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

  const resultado = await enviar('../php/modificar_organo.php', {
    id: id_organo.value,
    persona: persona.value,
    en_curso: en_curso.value
  });

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

  const resultado = await enviar('../php/eliminar_organo.php', { id: id_organo.value });

  if (resultado.exito) {
    alert(t('Registro eliminado correctamente'));
    limpiarOrgano();
    cargarAmbulancias();
  } else {
    alert(t(resultado.mensaje || 'Error al eliminar el registro'));
  }
});
