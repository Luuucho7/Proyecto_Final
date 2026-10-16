// Todo el código espera a que el HTML esté cargado antes de buscar los elementos
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del HTML que vamos a usar varias veces
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.getElementById('form-paciente');
    const botonMenu = document.getElementById('btn-menu-pacientes');
    const menu = document.getElementById('menu-derecho');

    // id_paciente es un input oculto: vacío = paciente nuevo, con valor = estamos editando ese paciente
    const id_paciente = document.getElementById('id_paciente');
    const nombre = document.getElementById('nombre');
    const cedula = document.getElementById('cedula');
    const telefono = document.getElementById('telefono');
    const estado = document.getElementById('estado');
    const botonGuardar = document.getElementById('boton-guardar-paciente');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    // Abre/cierra el menú lateral de esta página (es un menú propio, distinto al de java.js)
    if (botonMenu && menu) {
        botonMenu.addEventListener('click', () => {
            const abierto = menu.classList.toggle('abierto');
            botonMenu.setAttribute('aria-expanded', abierto.toString());
            botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    // Vuelve el formulario a "modo paciente nuevo": lo limpia y borra el id oculto
    function terminarEdicion() {
        formulario.reset();
        id_paciente.value = '';
        botonGuardar.textContent = 'Guardar Paciente';
        botonCancelar.style.display = 'none';
    }

    // Pide la lista de pacientes al servidor y arma la tabla de cero cada vez
    async function cargarPacientes() {
        const respuesta = await fetch('../php/listar_pacientes.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito || resultado.pacientes.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" class="sin-pacientes">No hay pacientes registrados todavía.</td></tr>';
            return;
        }

        // Una fila de tabla por cada paciente que vino de la base
        resultado.pacientes.forEach((paciente) => {
            const claseEstado = paciente.estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
            const textoEstado = paciente.estado === 'activo' ? 'Activo' : 'Inactivo';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${paciente.nombre}</td>
                <td>${paciente.cedula}</td>
                <td>${paciente.telefono || 'Sin registrar'}</td>
                <td><span class="estado ${claseEstado}">${textoEstado}</span></td>
                <td>
                    <button type="button" class="boton-editar">Editar</button>
                    <button type="button" class="boton-eliminar-fila">Eliminar</button>
                </td>
            `;

            // Botón "Editar" de ESTA fila: rellena el formulario con los datos de este paciente
            fila.querySelector('.boton-editar').addEventListener('click', () => {
                id_paciente.value = paciente.id_paciente; // clave: guarda el id, así el formulario queda en "modo edición"
                nombre.value = paciente.nombre;
                cedula.value = paciente.cedula;
                telefono.value = paciente.telefono || '';
                estado.value = paciente.estado;

                botonGuardar.textContent = 'Modificar Paciente';
                botonCancelar.style.display = 'inline-block';
                document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
            });

            // Botón "Eliminar" de ESTA fila
            fila.querySelector('.boton-eliminar-fila').addEventListener('click', async () => {
                if (!confirm('¿Seguro que querés eliminar a ' + paciente.nombre + '?')) {
                    return;
                }

                const datos = new FormData();
                datos.append('id', paciente.id_paciente);

                const respuesta = await fetch('../php/eliminar_paciente.php', {
                    method: 'POST',
                    body: datos
                });
                const resultado = await respuesta.json();

                if (resultado.exito) {
                    cargarPacientes(); // vuelve a pedir la lista para que la fila borrada desaparezca
                } else {
                    alert(resultado.mensaje || 'No se pudo eliminar el paciente');
                }
            });

            tablaBody.appendChild(fila);
        });
    }

    // Apenas carga la página, mostramos la lista de pacientes
    cargarPacientes();

    // Buscador: NO llama al servidor, filtra las filas que ya están dibujadas en la tabla
    if (buscadorInput && tablaBody) {
        buscadorInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();

            tablaBody.querySelectorAll('tr').forEach((fila) => {
                if (fila.querySelector('.sin-pacientes')) return;

                const nombreFila = fila.children[0].textContent.toLowerCase();
                const documentoFila = fila.children[1].textContent.toLowerCase();
                // Oculta (display:none) las filas que no coinciden con lo escrito
                fila.style.display = nombreFila.includes(busqueda) || documentoFila.includes(busqueda) ? '' : 'none';
            });
        });
    }

    // Envío del formulario: sirve tanto para crear como para modificar
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault(); // frena la recarga normal de la página

            if (!nombre.value.trim() || !cedula.value.trim()) return;

            const datos = new FormData();
            datos.append('id', id_paciente.value);
            datos.append('nombre', nombre.value.trim());
            datos.append('cedula', cedula.value.trim());
            datos.append('telefono', telefono.value.trim());
            datos.append('estado', estado.value);

            // Si el id oculto está vacío, es un paciente nuevo. Si tiene valor, es una edición.
            const creando = id_paciente.value === '';
            const url = creando ? '../php/guardar_paciente.php' : '../php/modificar_paciente.php';

            const respuesta = await fetch(url, { method: 'POST', body: datos });
            const resultado = await respuesta.json();

            if (resultado.exito) {
                alert(creando ? 'Paciente guardado correctamente' : 'Paciente modificado correctamente');
                terminarEdicion();
                cargarPacientes(); // refresca la tabla con el dato nuevo/editado
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(resultado.mensaje || 'No se pudo guardar el paciente');
            }
        });
    }

    // Botón "Cancelar edición": vuelve todo a "modo paciente nuevo" sin guardar nada
    if (botonCancelar) {
        botonCancelar.addEventListener('click', terminarEdicion);
    }
});
