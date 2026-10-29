
document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');

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

    const tipos = {
        biologico: { nombre: 'Biológico', detalle: 'Estado:' },
        no_biologico: { nombre: 'No biológico', detalle: 'Pendiente:' },
        organo: { nombre: 'Órgano', detalle: 'En curso:' }
    };

    const estadosTraslado = {
        en_camino:  { texto: 'En camino',  clase: 'estado-servicio', boton: 'Llegó al destino' },
        en_destino: { texto: 'En destino', clase: 'estado-activo',   boton: 'Inicia el retorno' },
        retornando: { texto: 'Retornando', clase: 'estado-servicio', boton: 'Volvió al hospital' },
        finalizado: { texto: 'Finalizado', clase: 'estado-inactivo', boton: '' }
    };

    const textoEstadoAmbulancia = {
        libre: 'Libre',
        ocupada: 'Ocupada',
        en_servicio: 'En servicio'
    };

    function fechaHora(valor) {
        if (!valor) {
            return '—';
        }

        const partes = valor.split(' ');
        const dia = partes[0].split('-');
        const hora = partes[1].substring(0, 5);

        return dia[2] + '/' + dia[1] + '/' + dia[0] + ' ' + hora;
    }

    function valorParaCampo(valor) {
        if (!valor) {
            return '';
        }
        return valor.replace(' ', 'T').substring(0, 16);
    }

    function dato(valor) {
        if (valor) {
            return valor;
        }
        return '—';
    }


    async function cargarTraslados() {
        const respuesta = await fetch('../php/listar_traslados.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito) {
            tablaBody.innerHTML = '<tr><td colspan="15" class="sin-pacientes"></td></tr>';
            tablaBody.querySelector('td').textContent = t(resultado.mensaje);
            return;
        }

        if (resultado.traslados.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="15" class="sin-pacientes">No hay traslados registrados todavía.</td></tr>';
            traducirPagina();
            return;
        }

        resultado.traslados.forEach((traslado) => {
            let tipo = tipos[traslado.tipo_elemento];

            if (!tipo) {
                tipo = { nombre: dato(traslado.tipo_elemento), detalle: 'Detalle:' };
            }

            let recorrido = '—';

            if (traslado.origen || traslado.destino) {
                recorrido = dato(traslado.origen) + ' → ' + dato(traslado.destino);
            }

            let estado = estadosTraslado[traslado.estado];

            if (!estado) {
                estado = { texto: dato(traslado.estado), clase: 'estado-inactivo', boton: '' };
            }

            const activo = (estado.boton !== '');
            const estadoHtml = '<span class="estado ' + estado.clase + '">' + estado.texto + '</span>';
            let botonesHtml = '—';

            if (activo) {
                botonesHtml = '<button type="button" class="boton-editar">Editar</button> ' +
                              '<button type="button" class="boton-editar boton-avanzar">' + estado.boton + '</button>';
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
                <td>${fechaHora(traslado.hora_llegada_real)}</td>
                <td>${fechaHora(traslado.hora_retorno)}</td>
                <td>${dato(traslado.paciente)}</td>
                <td>${estadoHtml}</td>
                <td>${botonesHtml}</td>
            `;

            if (activo) {
                fila.querySelector('.boton-editar').addEventListener('click', () => {
                    empezarEdicion(traslado);
                });

                fila.querySelector('.boton-avanzar').addEventListener('click', () => {
                    avanzarTraslado(traslado, estado.boton);
                });
            }

            tablaBody.appendChild(fila);
        });

        traducirPagina();
    }


    async function avanzarTraslado(traslado, accion) {
        let pregunta = t('Traslado Nº') + ' ' + traslado.id_traslado + ': ' + t(accion) + '?';

        if (traslado.estado === 'retornando') {
            pregunta = pregunta + ' ' + t('La ambulancia va a quedar libre.');
        }

        if (!confirm(pregunta)) {
            return;
        }

        const datos = new FormData();
        datos.append('id_traslado', traslado.id_traslado);

        const respuesta = await fetch('../php/avanzar_traslado.php', { method: 'POST', body: datos });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            if (resultado.estado === 'finalizado' && id_traslado.value === String(traslado.id_traslado)) {
                terminarEdicion();
            }
            cargarTraslados();
        } else {
            alert(t(resultado.mensaje || 'No se pudo actualizar el traslado.'));
        }
    }


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

    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = new FormData(formEditar);
        datos.append('id_traslado', id_traslado.value);

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


    activarBuscador('chofer', 'chofer');
    activarBuscador('copiloto', 'copiloto');
    cargarPersonas();

    cargarTraslados();

    buscadorInput.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase().trim();

        tablaBody.querySelectorAll('tr').forEach((fila) => {
            if (fila.querySelector('.sin-pacientes')) return;

            fila.style.display = fila.textContent.toLowerCase().includes(busqueda) ? '' : 'none';
        });
    });
});
