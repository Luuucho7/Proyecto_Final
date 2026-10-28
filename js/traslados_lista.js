// traslados_lista.js
// Muestra en una tabla todos los traslados registrados, con la información de cada uno.
// Los que están "En curso" se pueden modificar (botón "Editar") o terminar (botón "Finalizar").
// Al finalizar un traslado, su ambulancia vuelve a quedar libre.

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
    const botonGuardar = document.getElementById('boton-guardar-traslado');
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

    // Las fechas vienen de la base como "2026-10-28 14:30:00"; se muestran como "28/10/2026 14:30".
    // Si no hay fecha, una raya.
    function fechaHora(valor) {
        if (!valor) {
            return '—';
        }

        const partes = valor.split(' ');          // ["2026-10-28", "14:30:00"]
        const dia = partes[0].split('-');         // ["2026", "10", "28"]
        const hora = partes[1].substring(0, 5);   // "14:30"

        return dia[2] + '/' + dia[1] + '/' + dia[0] + ' ' + hora;
    }

    // El campo datetime-local necesita "2026-10-28T14:30" (con una T en el medio y sin segundos)
    function valorParaCampo(valor) {
        if (!valor) {
            return '';
        }
        return valor.replace(' ', 'T').substring(0, 16);
    }

    // Si no hay dato, una raya
    function dato(valor) {
        if (valor) {
            return valor;
        }
        return '—';
    }

    // ---------- Tabla de traslados ----------

    async function cargarTraslados() {
        const respuesta = await fetch('../php/listar_traslados.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito) {
            tablaBody.innerHTML = '<tr><td colspan="13" class="sin-pacientes"></td></tr>';
            tablaBody.querySelector('td').textContent = t(resultado.mensaje);
            return;
        }

        if (resultado.traslados.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="13" class="sin-pacientes">No hay traslados registrados todavía.</td></tr>';
            traducirPagina();
            return;
        }

        resultado.traslados.forEach((traslado) => {
            let tipo = tipos[traslado.tipo_elemento];

            if (!tipo) {
                tipo = { nombre: dato(traslado.tipo_elemento), detalle: 'Detalle:' };
            }

            // Recorrido: "origen → destino" (si no se eligió ninguna dirección, una raya)
            let recorrido = '—';

            if (traslado.origen || traslado.destino) {
                recorrido = dato(traslado.origen) + ' → ' + dato(traslado.destino);
            }

            // Estado del traslado y botones: solo los que están en curso se pueden editar o finalizar
            const enCurso = (traslado.estado === 'en_curso');
            let estadoHtml = '';
            let botonesHtml = '';

            if (enCurso) {
                estadoHtml = '<span class="estado estado-servicio">En curso</span>';
                botonesHtml = '<button type="button" class="boton-editar">Editar</button> ' +
                              '<button type="button" class="boton-editar boton-finalizar">Finalizar</button>';
            } else {
                estadoHtml = '<span class="estado estado-inactivo">Finalizado</span>';
                botonesHtml = '—';
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${traslado.id_traslado}</td>
                <td>${tipo.nombre}</td>
                <td>${dato(traslado.elemento)}</td>
                <td><span>${tipo.detalle}</span> <span>${dato(traslado.detalle)}</span></td>
                <td>${dato(traslado.matricula)}</td>
                <td>${recorrido}</td>
                <td>${dato(traslado.chofer)}</td>
                <td>${dato(traslado.copiloto)}</td>
                <td>${fechaHora(traslado.hora_salida)}</td>
                <td>${fechaHora(traslado.hora_llegada)}</td>
                <td>${dato(traslado.paciente)}</td>
                <td>${estadoHtml}</td>
                <td>${botonesHtml}</td>
            `;

            if (enCurso) {
                // El primer botón con clase "boton-editar" es Editar; el de "boton-finalizar" es Finalizar
                fila.querySelector('.boton-editar').addEventListener('click', () => {
                    empezarEdicion(traslado);
                });

                fila.querySelector('.boton-finalizar').addEventListener('click', () => {
                    finalizarTraslado(traslado);
                });
            }

            tablaBody.appendChild(fila);
        });

        // Las filas se dibujan en español: las traducimos si la página está en inglés
        traducirPagina();
    }

    // ---------- Finalizar un traslado ----------

    async function finalizarTraslado(traslado) {
        if (!confirm(t('¿Finalizar el traslado Nº') + ' ' + traslado.id_traslado + '? ' + t('La ambulancia va a quedar libre.'))) {
            return;
        }

        const datos = new FormData();
        datos.append('id_traslado', traslado.id_traslado);

        const respuesta = await fetch('../php/finalizar_traslado.php', { method: 'POST', body: datos });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            // Si justo se estaba editando este traslado, se cierra el formulario
            if (id_traslado.value === String(traslado.id_traslado)) {
                terminarEdicion();
            }
            cargarTraslados();
        } else {
            alert(t(resultado.mensaje || 'No se pudo finalizar el traslado'));
        }
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
            let estado = textoEstadoAmbulancia[a.estado];

            if (!estado) {
                estado = a.estado;
            }

            const opcion = new Option(a.matricula + ' - ' + t(estado), a.matricula);

            if (a.estado !== 'libre' && a.matricula !== matriculaActual) {
                opcion.disabled = true;
            }

            ambulancia.add(opcion);
        });

        ambulancia.value = matriculaActual;
    }

    // Llena la lista de pacientes: se pueden elegir los activos y el que ya tiene este traslado
    async function cargarPacientes(idActual) {
        const respuesta = await fetch('../php/listar_pacientes.php');
        const resultado = await respuesta.json();

        idPaciente.innerHTML = '';
        idPaciente.add(new Option(t('Sin paciente'), ''));

        if (!resultado.exito) {
            return;
        }

        resultado.pacientes.forEach((p) => {
            const esElActual = (String(p.id_paciente) === String(idActual));
            let texto = p.nombre + ' - CI ' + p.cedula;

            if (p.estado !== 'activo') {
                texto = texto + ' (' + t('Inactivo') + ')';
            }

            const opcion = new Option(texto, p.id_paciente);

            if (p.estado !== 'activo' && !esElActual) {
                opcion.disabled = true;
            }

            idPaciente.add(opcion);
        });

        if (idActual) {
            idPaciente.value = idActual;
        } else {
            idPaciente.value = '';
        }
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
        await cargarPacientes(traslado.id_paciente);

        id_traslado.value = traslado.id_traslado;
        chofer.value = traslado.chofer || '';
        copiloto.value = traslado.copiloto || '';
        horaSalida.value = valorParaCampo(traslado.hora_salida);
        horaLlegada.value = valorParaCampo(traslado.hora_llegada);

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

        // Se desactiva el botón mientras se espera la respuesta (para que un doble clic no mande dos veces)
        botonGuardar.disabled = true;

        try {
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
        } catch (error) {
            alert(t('No se pudo modificar el traslado'));
        }

        botonGuardar.disabled = false;
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
