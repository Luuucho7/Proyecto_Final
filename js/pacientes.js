document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.querySelector('.buscador input');
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.querySelector('.formulario-paciente form');
    const botonMenu = document.getElementById('btn-menu-pacientes');
    const menu = document.getElementById('menu-derecho');

    if (botonMenu && menu) {
        botonMenu.addEventListener('click', () => {
            const abierto = menu.classList.toggle('abierto');
            botonMenu.setAttribute('aria-expanded', abierto.toString());
            botonMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });
    }

    if (buscadorInput && tablaBody) {
        buscadorInput.addEventListener('input', (e) => {
            const busqueda = e.target.value.toLowerCase().trim();

            tablaBody.querySelectorAll('tr').forEach((fila) => {
                if (fila.querySelector('.sin-pacientes')) return;

                const nombre = fila.children[0].textContent.toLowerCase();
                const documento = fila.children[1].textContent.toLowerCase();
                fila.style.display = nombre.includes(busqueda) || documento.includes(busqueda) ? '' : 'none';
            });
        });
    }

    if (formulario && tablaBody) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const documento = document.getElementById('documento').value.trim();
            const telefono = document.getElementById('telefono').value.trim() || 'Sin registrar';
            const estado = document.getElementById('estado').value;

            if (!nombre || !documento) return;

            const nuevaFila = document.createElement('tr');
            const claseEstado = estado === 'activo' ? 'estado-activo' : 'estado-inactivo';
            const textoEstado = estado === 'activo' ? 'Activo' : 'Inactivo';

            nuevaFila.innerHTML = `
                <td>${nombre}</td>
                <td>${documento}</td>
                <td>${telefono}</td>
                <td><span class="estado ${claseEstado}">${textoEstado}</span></td>
            `;

            tablaBody.insertBefore(nuevaFila, tablaBody.firstChild);
            formulario.reset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});  
