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
            resultado.innerHTML = '<p>Traslado creado correctamente.</p>';
            mostrarDetalle(res.id_traslado, datos);
            formTraslado.reset();
            reiniciarSelector();
        } else {
            resultado.innerHTML = '<p>' + res.mensaje + '</p>';
        }

    } catch (error) {
        resultado.innerHTML = '<p>Error al crear el traslado.</p>';
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
}

// Llena la lista de nombres que se sugieren al escribir el chofer o el copiloto
async function cargarPersonas() {
    const respuesta = await fetch('../php/listar_personas.php');
    const resultado = await respuesta.json();

    const lista = document.getElementById('lista_personas');

    // Una <option> por cada nombre; el navegador muestra las que se parecen a lo escrito
    resultado.personas.forEach(nombre => {
        const opcion = document.createElement('option');
        opcion.value = nombre;
        lista.appendChild(opcion);
    });
}

cargarPersonas();

// Vuelve el formulario al estado inicial: sin tipo elegido y todo oculto
function reiniciarSelector() {
    document.querySelectorAll('.datos-elemento, #datos_traslado').forEach(fieldset => {
        fieldset.hidden = true;
        fieldset.disabled = true;
    });
    avisoTipo.hidden = false;
}
