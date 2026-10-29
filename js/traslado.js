const formTraslado = document.getElementById('form_traslado');
const datosTraslado = document.getElementById('datos_traslado');
const avisoTipo = document.getElementById('aviso_tipo');
const resultado = document.getElementById('resultado');

const nombresTipo = {
    biologico: 'Biológico',
    no_biologico: 'No biológico',
    organo: 'Órgano'
};

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

    const botonCrear = formTraslado.querySelector('button[type="submit"]');
    botonCrear.disabled = true;

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
            cargarAmbulancias();
            cargarPacientesTraslado();
        } else {
            resultado.innerHTML = '<p>' + t(res.mensaje) + '</p>';
        }

    } catch (error) {
        resultado.innerHTML = '<p>' + t('Error al crear el traslado.') + '</p>';
    }

    botonCrear.disabled = false;
});

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
    document.getElementById('d_estado').textContent = 'En camino';

    traducirPagina();
}


const listaAmbulancias = document.getElementById('ambulancia');

const textoEstadoAmbulancia = {
    libre: 'Libre',
    ocupada: 'Ocupada',
    en_servicio: 'En servicio'
};

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

    listaAmbulancias.length = 1;

    resultado.ambulancias.forEach(ambulancia => {
        const opcion = new Option('', ambulancia.matricula);
        opcion.dataset.estado = ambulancia.estado;

        opcion.disabled = (ambulancia.estado !== 'libre');

        listaAmbulancias.add(opcion);
    });

    ponerTextosAmbulancias();
}

document.addEventListener('cambioIdioma', ponerTextosAmbulancias);

cargarAmbulancias();



const listaPacientes = document.getElementById('id_paciente');

async function cargarPacientesTraslado() {
    const respuesta = await fetch('../php/listar_pacientes.php');
    const resultado = await respuesta.json();

    if (!resultado.exito) {
        return;
    }

    listaPacientes.length = 1;

    resultado.pacientes.forEach(paciente => {
        if (paciente.estado === 'activo') {
            const texto = paciente.nombre + ' - CI ' + paciente.cedula;
            listaPacientes.add(new Option(texto, paciente.id_paciente));
        }
    });
}

cargarPacientesTraslado();



activarBuscador('chofer', 'chofer');
activarBuscador('copiloto', 'copiloto');

cargarPersonas();

function reiniciarSelector() {
    document.querySelectorAll('.datos-elemento, #datos_traslado').forEach(fieldset => {
        fieldset.hidden = true;
        fieldset.disabled = true;
    });
    avisoTipo.hidden = false;
}
