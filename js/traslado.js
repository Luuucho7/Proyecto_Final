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

// ---------- Chofer y Copiloto: lista desplegable con buscador ----------

// Acá quedan los nombres de las personas de la base
let nombresPersonas = [];

// Para comparar sin importar mayúsculas ni tildes: "José" y "jose" cuentan como iguales
function simplificar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Convierte un campo de texto en una lista desplegable donde se puede escribir para buscar
function activarBuscador(idCampo) {
    const campo = document.getElementById(idCampo);
    const lista = campo.parentElement.querySelector('.opciones-lista');

    // Arma la lista. Si "filtrar" es true, muestra solo los nombres que contienen lo escrito
    function mostrarOpciones(filtrar) {
        const buscado = filtrar ? simplificar(campo.value) : '';
        lista.innerHTML = '';

        nombresPersonas.forEach(nombre => {
            if (simplificar(nombre).includes(buscado)) {
                const opcion = document.createElement('li');
                opcion.textContent = nombre;

                // Se usa mousedown (y no click) para elegir el nombre antes de que el campo pierda el foco
                opcion.addEventListener('mousedown', () => {
                    campo.value = nombre;
                    lista.hidden = true;
                });

                lista.appendChild(opcion);
            }
        });

        if (lista.children.length === 0) {
            const vacio = document.createElement('li');
            vacio.textContent = t('Sin resultados');
            vacio.className = 'sin-resultados';
            lista.appendChild(vacio);
        }

        lista.hidden = false;
    }

    // Al hacer clic se ven todos los nombres; al escribir, solo los que se parecen
    campo.addEventListener('focus', () => mostrarOpciones(false));
    campo.addEventListener('click', () => mostrarOpciones(false));
    campo.addEventListener('input', () => mostrarOpciones(true));

    // Al salir del campo se cierra la lista. Como en un select, solo vale un nombre de la lista
    campo.addEventListener('blur', () => {
        lista.hidden = true;

        if (!nombresPersonas.includes(campo.value)) {
            campo.value = '';
        }
    });
}

// Pide los nombres al servidor
async function cargarPersonas() {
    const respuesta = await fetch('../php/listar_personas.php');
    const resultado = await respuesta.json();

    nombresPersonas = resultado.personas;
}

activarBuscador('chofer');
activarBuscador('copiloto');

cargarPersonas();

// Vuelve el formulario al estado inicial: sin tipo elegido y todo oculto
function reiniciarSelector() {
    document.querySelectorAll('.datos-elemento, #datos_traslado').forEach(fieldset => {
        fieldset.hidden = true;
        fieldset.disabled = true;
    });
    avisoTipo.hidden = false;
}
