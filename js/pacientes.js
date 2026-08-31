document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const buscadorInput = document.querySelector('.buscador input');  
    const tablaBody = document.querySelector('.tabla-pacientes tbody');
    const formulario = document.querySelector('.formulario-paciente form');

    // 1. FILTRADO / BUSCADOR EN TIEMPO REAL
    buscadorInput.addEventListener('input', (e) => {
        const busqueda = e.target.value.toLowerCase().trim();
        const filas = tablaBody.querySelectorAll('tr');

        filas.forEach(fila => {
            // Ignorar la fila de "sin pacientes" si estuviera visible
            if (fila.querySelector('.sin-pacientes')) return;

            const nombre = fila.children[0].textContent.toLowerCase();
            const documento = fila.children[1].textContent.toLowerCase();

            if (nombre.includes(busqueda) || documento.includes(busqueda)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    });

    // 2. AGREGAR NUEVO PACIENTE DESDE EL FORMULARIO
    formulario.addEventListener('submit',(e) => {
        e.preventDefault(); // Evitar la recarga de página

        // Capturar valores
        const nombre = document.getElementById('nombre').value.trim();
        const documento = document.getElementById('documento').value.trim();
        const telefono = document.getElementById('telefono').value.trim() || 'Sin registrar';
        const estado = document.getElementById('estado').value;

        // Validar datos mínimos
        if (!nombre || !documento) return;

        // Crear nueva fila HTML
        const nuevaFila = document.createElement('tr');
        
        const claseEstado = estado === 'activo' ? 'activo' : 'inactivo';
        const textoEstado = estado === 'activo' ? 'Activo' : 'Inactivo';

        nuevaFila.innerHTML = `
            <td>${nombre}</td>
            <td>${documento}</td>
            <td>${telefono}</td>
            <td><span class="estado ${claseEstado}">${textoEstado}</span></td>
        `;

        // Insertar al inicio de la tabla
        tablaBody.insertBefore(nuevaFila, tablaBody.firstChild);

        // Limpiar formulario y hacer scroll hacia arriba
        formulario.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});