// traslados_lista.js
// Muestra en una tabla todos los traslados registrados, con la información de cada uno,
// y permite modificar un traslado con el botón "Editar".

document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');

    // Formulario para modificar un traslado
    const formulario = document.getElementById('formulario');
    const formEditar = document.getElementById('form-traslado-editar');
    const id_traslado = document.getElementById('id_traslado');
    const ambulancia = document.getElementById('ambulancia');
    const chofer = document.getElementById('chofer');
    const copiloto = document.getElementById('copiloto');
    const horaSalida = document.getElementById('hora_salida');
    const horaLlegada = document.getElementById('hora_llegada');
    const idPaciente = document.getElementById('id_paciente');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    // Nombre del tipo y nombre de lo que indica el "detalle" de cada tipo de elemento
    const tipos = {
        biologico: { nombre: 'Biológico', detalle: 'Estado:' },
        no_biologico: { nombre: 'No biológico', detalle: 'Pendiente:' },
        organo: { nombre: 'Órgano', detalle: 'En curso:' }
    };

    const textoEstadoAmbulancia = {
        libre: 'Libre',
        ocupada: 'Ocupada',
        en_servicio: 'En servicio'
    };

    // Las horas vienen como 14:30:00; mostramos solo 14:30. Si no hay hora, una raya.
    function hora(valor) {
        return valor ? valor.substring(0, 5) : '—';
    }

    // Si no hay dato, una raya
    function dato(valor) {
        return valor ? valor : '—';
    }

    // ---------- Tabla de traslados ----------

    async function cargarTraslados() {
        const respuesta = await fetch('../php/listar_traslados.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito || resultado.traslados.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="11" class="sin-pacientes">No hay traslados registrados todavía.</td></tr>';
            traducirPagina();
            return;
        }

        resultado.traslados.forEach((traslado) => {
            const tipo = tipos[traslado.tipo_elemento] || { nombre: dato(traslado.tipo_elemento), detalle: 'Detalle:' };

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${traslado.id_traslado}</td>
                <td>${tipo.nombre}</td>
                <td>${dato(traslado.elemento)}</td>
                <td><span>${tipo.detalle}</span> <span>${dato(traslado.detalle)}</span></td>
                <td>${dato(traslado.matricula)}</td>
                <td>${dato(traslado.chofer)}</td>
                <td>${dato(traslado.copiloto)}</td>
                <td>${hora(traslado.hora_salida)}</td>
                <td>${hora(traslado.hora_llegada)}</td>
                <td>${dato(traslado.paciente)}</td>
                <td><button type="button" class="boton-editar">Editar</button></td>
            `;

            fila.querySelector('.boton-editar').addEventListener('click', () => {
                empezarEdicion(traslado);
            });

            tablaBody.appendChild(fila);
        });

        // Las filas se dibujan en español: las traducimos si la página está en inglés
        traducirPagina();
    }

    // ---------- Modificar un traslado ----------

    // Llena la lista de ambulancias: se pueden elegir las libres y la que ya tiene este traslado
    async function cargarAmbulancias(matriculaActual) {
        const respuesta = await fetch('../php/listar_ambulancias.php');
        const resultado = await respuesta.json();

        ambulancia.innerHTML = '';

        if (!resultado.exito) {
            return;
        }

        resultado.ambulancias.forEach((a) => {
            const estado = textoEstadoAmbulancia[a.estado] || a.estado;
            const opcion = new Option(a.matricula + ' - ' + t(estado), a.matricula);

            opcion.disabled = (a.estado !== 'libre' && a.matricula !== matriculaActual);
            ambulancia.add(opcion);
        });

        ambulancia.value = matriculaActual;
    }

    // Si el traslado tiene un nombre que no está en las listas (por ejemplo, escrito a mano antes),
    // se agrega a la lista para que el buscador no lo borre
    function asegurarNombre(rol, nombre) {
        if (nombre && !nombresPorRol[rol].includes(nombre)) {
            nombresPorRol[rol].push(nombre);
        }
    }

    async function empezarEdicion(traslado) {
        asegurarNombre('chofer', traslado.chofer);
        asegurarNombre('copiloto', traslado.copiloto);

        await cargarAmbulancias(traslado.matricula);

        id_traslado.value = traslado.id_traslado;
        chofer.value = traslado.chofer || '';
        copiloto.value = traslado.copiloto || '';
        horaSalida.value = traslado.hora_salida ? traslado.hora_salida.substring(0, 5) : '';
        horaLlegada.value = traslado.hora_llegada ? traslado.hora_llegada.substring(0, 5) : '';
        idPaciente.value = traslado.id_paciente || '';

        formulario.style.display = 'block';
        traducirPagina();
        formulario.scrollIntoView({ behavior: 'smooth' });
    }

    function terminarEdicion() {
        formEditar.reset();
        id_traslado.value = '';
        formulario.style.display = 'none';
    }

    // Guardar los cambios
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = new FormData(formEditar);
        datos.append('id_traslado', id_traslado.value);

        const respuesta = await fetch('../php/modificar_traslado.php', { method: 'POST', body: datos });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(t('Traslado modificado correctamente'));
            terminarEdicion();
            cargarTraslados();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert(t(resultado.mensaje || 'No se pudo modificar el traslado'));
        }
    });

    botonCancelar.addEventListener('click', terminarEdicion);

    // ---------- Arranque ----------

    // Las listas de Chofer y Copiloto (el código está en js/buscador_nombres.js)
    activarBuscador('chofer', 'chofer');
    activarBuscador('copiloto', 'copiloto');
    cargarPersonas();

    cargarTraslados();

    // Buscador: oculta las filas que no contienen lo escrito en ninguna de sus columnas
    buscadorInput.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase().trim();

        tablaBody.querySelectorAll('tr').forEach((fila) => {
            if (fila.querySelector('.sin-pacientes')) return;

            fila.style.display = fila.textContent.toLowerCase().includes(busqueda) ? '' : 'none';
        });
    });
});
