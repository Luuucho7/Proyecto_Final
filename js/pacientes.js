document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.getElementById('form-paciente');
    const botonMenu = document.getElementById('btn-menu-pacientes');
    const menu = document.getElementById('menu-derecho');

    const id_paciente = document.getElementById('id_paciente');
    const nombre = document.getElementById('nombre');
    const cedula = document.getElementById('cedula');
    const telefono = document.getElementById('telefono');
    const estado = document.getElementById('estado');
    const botonGuardar = document.getElementById('boton-guardar-paciente');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    // ---- Menú lateral ----
    if (botonMenu && menu) {
        botonMenu.addEventListener('click', () => {
            const abierto = menu.classList.toggle('abierto');
            botonMenu.setAttribute('aria-expanded', abierto.toString());
            botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    // ---- Vuelve el formulario al modo "paciente nuevo" ----
    function terminarEdicion() {
        formulario.reset();
        id_paciente.value = '';
        botonGuardar.textContent = 'Guardar Paciente';
        botonCancelar.style.display = 'none';
    }

    // ---- Le pide la lista de pacientes a la base y arma la tabla ----
    async function cargarPacientes() {
        const respuesta = await fetch('../php/listar_pacientes.php');
        const resultado = await respuesta.json();

        tablaBody.innerHTML = '';

        if (!resultado.exito || resultado.pacientes.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="5" class="sin-pacientes">No hay pacientes registrados todavía.</td></tr>';
            return;
        }

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

            // Editar: carga los datos de este paciente en el formulario
            fila.querySelector('.boton-editar').addEventListener('click', () => {
                id_paciente.value = paciente.id_paciente;
                nombre.value = paciente.nombre;
                cedula.value = paciente.cedula;
                telefono.value = paciente.telefono || '';
                estado.value = paciente.estado;

                botonGuardar.textContent = 'Modificar Paciente';
                botonCancelar.style.display = 'inline-block';
                document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
            });

            // Eliminar: borra este paciente, pidiendo confirmación antes
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
                    cargarPacientes();
                } else {
                    alert(resultado.mensaje || 'No se pudo eliminar el paciente');
                }
            });

            tablaBody.appendChild(fila);
        });
    }

    cargarPacientes();

    // ---- Buscador: filtra lo que ya está mostrado en la tabla ----
    if (buscadorInput && tablaBody) {
        buscadorInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();

            tablaBody.querySelectorAll('tr').forEach((fila) => {
                if (fila.querySelector('.sin-pacientes')) return;

                const nombreFila = fila.children[0].textContent.toLowerCase();
                const documentoFila = fila.children[1].textContent.toLowerCase();
                fila.style.display = nombreFila.includes(busqueda) || documentoFila.includes(busqueda) ? '' : 'none';
            });
        });
    }

    // ---- Guardar (crear) o Modificar, según si hay un id cargado ----
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!nombre.value.trim() || !cedula.value.trim()) return;

            const datos = new FormData();
            datos.append('id', id_paciente.value);
            datos.append('nombre', nombre.value.trim());
            datos.append('cedula', cedula.value.trim());
            datos.append('telefono', telefono.value.trim());
            datos.append('estado', estado.value);

            // Si el id está vacío, estamos creando; si no, estamos modificando
            const creando = id_paciente.value === '';
            const url = creando ? '../php/guardar_paciente.php' : '../php/modificar_paciente.php';

            const respuesta = await fetch(url, { method: 'POST', body: datos });
            const resultado = await respuesta.json();

            if (resultado.exito) {
                alert(creando ? 'Paciente guardado correctamente' : 'Paciente modificado correctamente');
                terminarEdicion();
                cargarPacientes();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(resultado.mensaje || 'No se pudo guardar el paciente');
            }
        });
    }

    if (botonCancelar) {
        botonCancelar.addEventListener('click', terminarEdicion);
    }
});