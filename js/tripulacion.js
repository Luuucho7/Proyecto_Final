// tripulacion.js
// Lo mismo que pacientes.js, pero para choferes y copilotos:
// muestra la tabla, busca por nombre, y permite guardar, modificar y eliminar.

document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.getElementById('form-tripulante');

    const id_tripulante = document.getElementById('id_tripulante');
    const nombre = document.getElementById('nombre');
    const telefono = document.getElementById('telefono');
    const rol = document.getElementById('rol');
    const botonGuardar = document.getElementById('boton-guardar-tripulante');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    // Cómo se ve cada rol en la tabla: el texto y el color de la etiqueta
    const roles = {
        chofer: { texto: 'Chofer', clase: 'estado-activo' },
        copiloto: { texto: 'Copiloto', clase: 'estado-servicio' }
    };

    // Vuelve el formulario a "Guardar datos" (sin ninguna persona en edición)
    function terminarEdicion() {
        formulario.reset();
        id_tripulante.value = '';
        botonGuardar.textContent = 'Guardar datos';
        botonCancelar.style.display = 'none';
        traducirPagina();
    }

    async function cargarTripulantes() {
        const respuesta = await fetch('../php/listar_tripulacion.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito || resultado.tripulantes.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="4" class="sin-pacientes">No hay choferes ni copilotos registrados todavía.</td></tr>';
            traducirPagina();
            return;
        }

        resultado.tripulantes.forEach((tripulante) => {
            const datosRol = roles[tripulante.rol] || roles.chofer;

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${tripulante.nombre}</td>
                <td>${tripulante.telefono || 'Sin registrar'}</td>
                <td><span class="estado ${datosRol.clase}">${datosRol.texto}</span></td>
                <td>
                    <button type="button" class="boton-editar">Editar</button>
                    <button type="button" class="boton-eliminar-fila">Eliminar</button>
                </td>
            `;

            fila.querySelector('.boton-editar').addEventListener('click', () => {
                id_tripulante.value = tripulante.id_tripulante;
                nombre.value = tripulante.nombre;
                telefono.value = tripulante.telefono || '';
                rol.value = tripulante.rol;

                botonGuardar.textContent = 'Modificar datos';
                botonCancelar.style.display = 'inline-block';
                traducirPagina();
                document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
            });

            fila.querySelector('.boton-eliminar-fila').addEventListener('click', async () => {
                if (!confirm(t('¿Seguro que querés eliminar a') + ' ' + tripulante.nombre + '?')) {
                    return;
                }

                const datos = new FormData();
                datos.append('id', tripulante.id_tripulante);

                const respuesta = await fetch('../php/eliminar_tripulante.php', {
                    method: 'POST',
                    body: datos
                });
                const resultado = await respuesta.json();

                if (resultado.exito) {
                    cargarTripulantes();
                } else {
                    alert(t(resultado.mensaje || 'No se pudo eliminar el chofer o copiloto'));
                }
            });

            tablaBody.appendChild(fila);
        });

        // Las filas se dibujan en español: las traducimos si la página está en inglés
        traducirPagina();
    }

    cargarTripulantes();

    // Buscador: oculta las filas cuyo nombre no contiene lo escrito
    if (buscadorInput && tablaBody) {
        buscadorInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();

            tablaBody.querySelectorAll('tr').forEach((fila) => {
                if (fila.querySelector('.sin-pacientes')) return;

                const nombreFila = fila.children[0].textContent.toLowerCase();
                fila.style.display = nombreFila.includes(busqueda) ? '' : 'none';
            });
        });
    }

    // Guardar (si es nuevo) o modificar (si se estaba editando)
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!nombre.value.trim()) return;

            const datos = new FormData();
            datos.append('id', id_tripulante.value);
            datos.append('nombre', nombre.value.trim());
            datos.append('telefono', telefono.value.trim());
            datos.append('rol', rol.value);

            const creando = id_tripulante.value === '';
            const url = creando ? '../php/guardar_tripulante.php' : '../php/modificar_tripulante.php';

            const respuesta = await fetch(url, { method: 'POST', body: datos });
            const resultado = await respuesta.json();

            if (resultado.exito) {
                alert(t(creando ? 'Guardado correctamente' : 'Modificado correctamente'));
                terminarEdicion();
                cargarTripulantes();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(t(resultado.mensaje || 'No se pudo guardar el chofer o copiloto'));
            }
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener('click', terminarEdicion);
    }
});
