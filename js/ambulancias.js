
document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.getElementById('form-ambulancia');

    const id_ambulancia = document.getElementById('id_ambulancia');
    const matricula = document.getElementById('matricula');
    const estado = document.getElementById('estado');
    const botonGuardar = document.getElementById('boton-guardar-ambulancia');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    const estados = {
        libre: { texto: 'Libre', clase: 'estado-activo' },
        ocupada: { texto: 'Ocupada', clase: 'estado-inactivo' },
        en_servicio: { texto: 'En servicio', clase: 'estado-servicio' }
    };

    function terminarEdicion() {
        formulario.reset();
        id_ambulancia.value = '';
        matricula.readOnly = false;
        botonGuardar.textContent = 'Guardar Ambulancia';
        botonCancelar.style.display = 'none';
        traducirPagina();
    }

    async function cargarAmbulancias() {
        const respuesta = await fetch('../php/listar_ambulancias.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito) {
            tablaBody.innerHTML = '<tr><td colspan="3" class="sin-pacientes"></td></tr>';
            tablaBody.querySelector('td').textContent = t(resultado.mensaje);
            return;
        }

        if (resultado.ambulancias.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="3" class="sin-pacientes">No hay ambulancias registradas todavía.</td></tr>';
            traducirPagina();
            return;
        }

        resultado.ambulancias.forEach((ambulancia) => {
            const datosEstado = estados[ambulancia.estado] || estados.libre;

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${ambulancia.matricula}</td>
                <td><span class="estado ${datosEstado.clase}">${datosEstado.texto}</span></td>
                <td>
                    <button type="button" class="boton-editar">Editar</button>
                    <button type="button" class="boton-eliminar-fila">Eliminar</button>
                </td>
            `;

            fila.querySelector('.boton-editar').addEventListener('click', () => {
                id_ambulancia.value = ambulancia.matricula;
                matricula.value = ambulancia.matricula;
                estado.value = ambulancia.estado;

                matricula.readOnly = true;
                botonGuardar.textContent = 'Modificar Ambulancia';
                botonCancelar.style.display = 'inline-block';
                traducirPagina();
                document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
            });

            fila.querySelector('.boton-eliminar-fila').addEventListener('click', async () => {
                if (!confirm(t('¿Seguro que querés eliminar la ambulancia') + ' ' + ambulancia.matricula + '?')) {
                    return;
                }

                const datos = new FormData();
                datos.append('id', ambulancia.matricula);

                const respuesta = await fetch('../php/eliminar_ambulancia.php', {
                    method: 'POST',
                    body: datos
                });
                const resultado = await respuesta.json();

                if (resultado.exito) {
                    if (id_ambulancia.value === ambulancia.matricula) {
                        terminarEdicion();
                    }
                    cargarAmbulancias();
                } else {
                    alert(t(resultado.mensaje || 'No se pudo eliminar la ambulancia'));
                }
            });

            tablaBody.appendChild(fila);
        });

        traducirPagina();
    }

    cargarAmbulancias();

    if (buscadorInput && tablaBody) {
        buscadorInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();

            tablaBody.querySelectorAll('tr').forEach((fila) => {
                if (fila.querySelector('.sin-pacientes')) return;

                const matriculaFila = fila.children[0].textContent.toLowerCase();
                fila.style.display = matriculaFila.includes(busqueda) ? '' : 'none';
            });
        });
    }

    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!matricula.value.trim()) return;

            const datos = new FormData();
            datos.append('id', id_ambulancia.value);
            datos.append('matricula', matricula.value.trim());
            datos.append('estado', estado.value);

            const creando = id_ambulancia.value === '';
            const url = creando ? '../php/guardar_ambulancia.php' : '../php/modificar_ambulancia.php';

            const respuesta = await fetch(url, { method: 'POST', body: datos });
            const resultado = await respuesta.json();

            if (resultado.exito) {
                alert(t(creando ? 'Ambulancia guardada correctamente' : 'Ambulancia modificada correctamente'));
                terminarEdicion();
                cargarAmbulancias();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(t(resultado.mensaje || 'No se pudo guardar la ambulancia'));
            }
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener('click', terminarEdicion);
    }
});
