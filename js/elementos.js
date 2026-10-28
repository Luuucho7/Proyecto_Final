const id_biologico = document.getElementById('id_biologico');
const nombre = document.getElementById('nombre');
const estado = document.getElementById('estado');
const formBiologico = document.getElementById('form_biologico');

const buscar = document.getElementById('buscar');
const buscar_boton = document.getElementById('buscar_boton');

buscar_boton.addEventListener('click', async (e) => {
  e.preventDefault();

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
    alert(t('No se encontró el insumo.'));
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
    formBiologico.reset();
    id_biologico.value = '';
  } else {
    alert(t('Error al realizar la modificación'));
  }
});

const del_b = document.getElementById('del_b');

del_b.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés eliminar.'));
    return;
  }

  if (!confirm(t('¿Seguro que querés eliminar este insumo?'))) {
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
    formBiologico.reset();
    id_biologico.value = '';
  } else {
    alert(t('Error al eliminar el insumo'));
  }
});

const id_no_biologico = document.getElementById('id_no_biologico');
const clasificacion = document.getElementById('clasificacion');
const pendiente = document.getElementById('pendiente');
const formNoBiologico = document.getElementById('form_no_biologico');

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
    alert(t('No se encontró el insumo.'));
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
    formNoBiologico.reset();
    id_no_biologico.value = '';
  } else {
    alert(t('Error al realizar la modificación'));
  }
});

const del_no = document.getElementById('del_no');

del_no.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_no_biologico.value === '') {
    alert(t('Primero buscá el insumo que querés eliminar.'));
    return;
  }

  if (!confirm(t('¿Seguro que querés eliminar este insumo?'))) {
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
    formNoBiologico.reset();
    id_no_biologico.value = '';
  } else {
    alert(t('Error al eliminar el insumo'));
  }
});

const id_organo = document.getElementById('id_organo');
const persona = document.getElementById('persona');
const en_curso = document.getElementById('en_curso');
const formOrgano = document.getElementById('form_organo');

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
    alert(t('No se encontró el registro.'));
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
    formOrgano.reset();
    id_organo.value = '';
  } else {
    alert(t('Error al realizar la modificación'));
  }
});

const del_org = document.getElementById('del_org');

del_org.addEventListener('click', async (e) => {
  e.preventDefault();

  if (id_organo.value === '') {
    alert(t('Primero buscá el registro que querés eliminar.'));
    return;
  }

  if (!confirm(t('¿Seguro que querés eliminar este registro?'))) {
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
    formOrgano.reset();
    id_organo.value = '';
  } else {
    alert(t('Error al eliminar el registro'));
  }
});
  