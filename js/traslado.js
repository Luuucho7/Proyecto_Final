const formTraslado = document.getElementById('form_traslado');
const datosTraslado = document.getElementById('datos_traslado');
const avisoTipo = document.getElementById('aviso_tipo');
const resultado = document.getElementById('resultado');

const nombresTipo = {
    biologico: 'Biológico',
    no_biologico: 'No biológico',
    organo: 'Órgano'
};

// Al elegir un tipo, se muestran solo los campos de ese tipo.
// Los fieldset ocultos quedan "disabled", así no se validan ni se envían.
document.querySelectorAll('input[name="tipo"]').forEach(radio => {
    radio.addEventListener('change', () => {

        document.querySelectorAll('.datos-elemento').forEach(fieldset => {
            const elegido = fieldset.dataset.tipo === radio.value;
            fieldset.hidden = !elegido;
            fieldset.disabled = !elegido;
        });

        datosTraslado.hidden = false;
        datosTraslado.disabled = false;
        avisoTipo.hidden = true;
        resultado.innerHTML = '';
    });
});

formTraslado.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = new FormData(formTraslado);

    try {
        const respuesta = await fetch('../php/traslado.php', {
            method: 'POST',
            body: datos
        });
        const res = await respuesta.json();

        if (res.exito) {
            resultado.innerHTML = '<p>' + t('Traslado creado correctamente.') + '</p>';
            mostrarDetalle(res.id_traslado, datos);
            formTraslado.reset();
            reiniciarSelector();
            // La ambulancia que se usó ahora está "En servicio": se vuelve a pedir la lista
            cargarAmbulancias();
        } else {
            resultado.innerHTML = '<p>' + t(res.mensaje) + '</p>';
        }

    } catch (error) {
        resultado.innerHTML = '<p>' + t('Error al crear el traslado.') + '</p>';
    }
});

// Completa la tabla "Detalle de la solicitud" con el traslado recién creado
function mostrarDetalle(id, datos) {
    const tipo = datos.get('tipo');
    const elemento = {
        biologico: datos.get('nombre'),
        no_biologico: datos.get('clasificacion'),
        organo: datos.get('persona')
    }[tipo];

    document.getElementById('d_id').textContent = id;
    document.getElementById('d_elemento').textContent = elemento;
    document.getElementById('d_tipo').textContent = nombresTipo[tipo];
    document.getElementById('d_ambulancia').textContent = datos.get('matricula');
    document.getElementById('d_origen').textContent = datos.get('origen') || '—';
    document.getElementById('d_destino').textContent = datos.get('destino') || '—';
    document.getElementById('d_estado').textContent = 'Solicitado';

    // Los datos se escriben en español: los traducimos si la página está en inglés
    traducirPagina();
}

// ---------- Lista de ambulancias (viene de la base de datos) ----------

const listaAmbulancias = document.getElementById('ambulancia');

const textoEstadoAmbulancia = {
    libre: 'Libre',
    ocupada: 'Ocupada',
    en_servicio: 'En servicio'
};

// Escribe el texto de cada opción, por ejemplo "SBA 3355 - Libre", en el idioma elegido
function ponerTextosAmbulancias() {
    listaAmbulancias.querySelectorAll('option[data-estado]').forEach(opcion => {
        const estado = opcion.dataset.estado;
        opcion.textContent = opcion.value + ' - ' + t(textoEstadoAmbulancia[estado] || estado);
    });
}

async function cargarAmbulancias() {
    const respuesta = await fetch('../php/listar_ambulancias.php');
    const resultado = await respuesta.json();

    if (!resultado.exito) {
        return;
    }

    // Se borran las opciones anteriores, menos la primera ("Seleccionar ambulancia")
    while (listaAmbulancias.options.length > 1) {
        listaAmbulancias.remove(1);
    }

    resultado.ambulancias.forEach(ambulancia => {
        const opcion = new Option('', ambulancia.matricula);
        opcion.dataset.estado = ambulancia.estado;

        // Se ven todas, pero solo se pueden elegir las que están libres
        opcion.disabled = (ambulancia.estado !== 'libre');

        listaAmbulancias.add(opcion);
    });

    ponerTextosAmbulancias();
}

// Cuando se cambia el idioma, se vuelven a escribir los textos de las opciones
document.addEventListener('cambioIdioma', ponerTextosAmbulancias);

cargarAmbulancias();


// ---------- Chofer y Copiloto: lista desplegable con buscador (el código está en js/buscador_nombres.js) ----------

activarBuscador('chofer', 'chofer');
activarBuscador('copiloto', 'copiloto');

cargarPersonas();

// Vuelve el formulario al estado inicial: sin tipo elegido y todo oculto
function reiniciarSelector() {
    document.querySelectorAll('.datos-elemento, #datos_traslado').forEach(fieldset => {
        fieldset.hidden = true;
        fieldset.disabled = true;
    });
    avisoTipo.hidden = false;
}
