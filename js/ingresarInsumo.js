// Maneja los 3 formularios de la página "Elemento a trasladar":
// Ingresar (crear), Buscar, Modificar y Eliminar, para Biológico, No biológico y Órgano.
//
// Modificar y Eliminar trabajan con el "id" de la fila (un campo oculto que se
// llena solo cuando encontrás el elemento con "Buscar"). Por eso, para poder
// modificar o eliminar, primero hay que buscar.
//
// Ojo con los campos "hidden": a diferencia de un input de texto normal,
// form.reset() NO los vacía solo. Por eso, después de cada acción, limpiamos
// el id "a mano" con id_xxx.value = ''.

// ================= BIOLÓGICO =================
const id_biologico = document.getElementById('id_biologico');
const nombre = document.getElementById('nombre');
const estado = document.getElementById('estado');
const formBiologico = document.getElementById('form_biologico');

// Ingresar
formBiologico.addEventListener('submit', async (e) => {
  e.preventDefault(); // no recargar la página

  const datos = new FormData(formBiologico);

  const respuesta = await fetch('../php/ingresarInsumo.php', {
    method: 'POST',
    body: datos
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert('Insumo ingresado correctamente');
    formBiologico.reset();
    id_biologico.value = '';
  } else {
    alert(resultado.mensaje || 'Error al ingresar el insumo');
  }
});

// Buscar
const buscar = document.getElementById('buscar');
const buscar_boton = document.getElementById('buscar_boton');

buscar_boton.addEventListener('click', async (e) => {
  e.preventDefault(); // frena la recarga de la página

  const datosBusqueda = new FormData();
  datosBusqueda.append('nombre', buscar.value);

  const respuesta = await fetch('../php/buscar_Ingresar.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    document.getElementById('form_buscar').reset();
    id_biologico.value = resultado.datos.id;
    nombre.value = resultado.datos.nombre;
    estado.value = resultado.datos.estado;
  } else {
    alert('No se encontró el insumo.');
  }
});

// Modificar
const mod_b = document.getElementById('mod_b');

mod_b.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_biologico.value === '') {
    alert('Primero buscá el insumo que querés modificar.');
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
    alert('Elemento modificado correctamente');
    formBiologico.reset();
    id_biologico.value = '';
  } else {
    alert('Error al realizar la modificación');
  }
});

// Eliminar
const del_b = document.getElementById('del_b');

del_b.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_biologico.value === '') {
    alert('Primero buscá el insumo que querés eliminar.');
    return;
  }

  if (!confirm('¿Seguro que querés eliminar este insumo?')) {
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
    alert('Insumo eliminado correctamente');
    formBiologico.reset();
    id_biologico.value = '';
  } else {
    alert('Error al eliminar el insumo');
  }
});


// ================= NO BIOLÓGICO =================
const id_no_biologico = document.getElementById('id_no_biologico');
const clasificacion = document.getElementById('clasificacion');
const pendiente = document.getElementById('pendiente');
const formNoBiologico = document.getElementById('form_no_biologico');

// Ingresar
formNoBiologico.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = new FormData(formNoBiologico);

  const respuesta = await fetch('../php/no_biologico.php', {
    method: 'POST',
    body: datos
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert('Insumo ingresado correctamente');
    formNoBiologico.reset();
    id_no_biologico.value = '';
  } else {
    alert(resultado.mensaje || 'Error al ingresar el insumo');
  }
});

// Buscar
const encontrar = document.getElementById('encontrar');
const buscar_boton_no = document.getElementById('buscar_boton_nobiologico');

buscar_boton_no.addEventListener('click', async (e) => {
  e.preventDefault();

  const datosBusqueda = new FormData();
  datosBusqueda.append('clasificacion', encontrar.value);

  const respuesta = await fetch('../php/buscar_noBiologico.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    document.getElementById('form_noB').reset();
    id_no_biologico.value = resultado.datos.id;
    clasificacion.value = resultado.datos.clasificacion;
    pendiente.value = resultado.datos.pendiente;
  } else {
    alert('No se encontró el insumo.');
  }
});

// Modificar
const mod_no = document.getElementById('mod_no');

mod_no.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_no_biologico.value === '') {
    alert('Primero buscá el insumo que querés modificar.');
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
    alert('Elemento modificado correctamente');
    formNoBiologico.reset();
    id_no_biologico.value = '';
  } else {
    alert('Error al realizar la modificación');
  }
});

// Eliminar
const del_no = document.getElementById('del_no');

del_no.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_no_biologico.value === '') {
    alert('Primero buscá el insumo que querés eliminar.');
    return;
  }

  if (!confirm('¿Seguro que querés eliminar este insumo?')) {
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
    alert('Insumo eliminado correctamente');
    formNoBiologico.reset();
    id_no_biologico.value = '';
  } else {
    alert('Error al eliminar el insumo');
  }
});


// ================= ÓRGANO =================
const id_organo = document.getElementById('id_organo');
const persona = document.getElementById('persona');
const en_curso = document.getElementById('en_curso');
const formOrgano = document.getElementById('form_organo');

// Ingresar
formOrgano.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = new FormData(formOrgano);

  const respuesta = await fetch('../php/organo.php', {
    method: 'POST',
    body: datos
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    alert('Registro ingresado correctamente');
    formOrgano.reset();
    id_organo.value = '';
  } else {
    alert(resultado.mensaje || 'Error al ingresar el registro');
  }
});

// Buscar
const encontrar_organo = document.getElementById('encontrar_org');
const buscar_boton_organo = document.getElementById('button_org');

buscar_boton_organo.addEventListener('click', async (e) => {
  e.preventDefault();

  const datosBusqueda = new FormData();
  datosBusqueda.append('persona', encontrar_organo.value);

  const respuesta = await fetch('../php/buscar_organo.php', {
    method: 'POST',
    body: datosBusqueda
  });
  const resultado = await respuesta.json();

  if (resultado.exito) {
    document.getElementById('form_org').reset();
    id_organo.value = resultado.datos.id;
    persona.value = resultado.datos.persona;
    en_curso.value = resultado.datos.en_curso;
  } else {
    alert('No se encontró el registro.');
  }
});

// Modificar
const mod_org = document.getElementById('mod_org');

mod_org.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_organo.value === '') {
    alert('Primero buscá el registro que querés modificar.');
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
    alert('Registro modificado correctamente');
    formOrgano.reset();
    id_organo.value = '';
  } else {
    alert('Error al realizar la modificación');
  }
});

// Eliminar
const del_org = document.getElementById('del_org');

del_org.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_organo.value === '') {
    alert('Primero buscá el registro que querés eliminar.');
    return;
  }

  if (!confirm('¿Seguro que querés eliminar este registro?')) {
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
    alert('Registro eliminado correctamente');
    formOrgano.reset();
    id_organo.value = '';
  } else {
    alert('Error al eliminar el registro');
  }
});
