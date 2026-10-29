// encuestas_resultados.js
// Pide a php/resultados_encuestas.php los indicadores de satisfacción y los muestra:
// tarjetas con los números principales, barras de la calificación de la atención,
// una tabla que compara los servicios y los últimos comentarios.

document.addEventListener('DOMContentLoaded', () => {
    const filtroServicio = document.getElementById('servicio');
    const barrasAtencion = document.getElementById('barras_atencion');
    const tablaServicios = document.getElementById('tabla_servicios');
    const listaComentarios = document.getElementById('lista_comentarios');

    // Las calificaciones de la atención, de la mejor a la peor
    const calificaciones = ['Excelente', 'Muy Buena', 'Buena', 'Regular', 'Mala'];

    // MySQL devuelve los promedios como texto ("4.2500"). Si no hay encuestas, viene null y se muestra una raya
    function numero(valor, decimales) {
        if (valor === null || valor === undefined) {
            return '—';
        }
        return Number(valor).toFixed(decimales);
    }

    function porcentaje(valor) {
        if (valor === null || valor === undefined) {
            return '—';
        }
        return Math.round(Number(valor)) + '%';
    }

    // La fecha viene como "2026-10-29 10:02:00"; se muestra como "29/10/2026"
    function fecha(valor) {
        const dia = valor.split(' ')[0].split('-');
        return dia[2] + '/' + dia[1] + '/' + dia[0];
    }

    // ---------- Tarjetas ----------

    function mostrarGenerales(g) {
        document.getElementById('i_total').textContent = g.total;
        document.getElementById('i_satisfechos').textContent = porcentaje(g.satisfechos);
        document.getElementById('i_atencion').textContent = numero(g.atencion_promedio, 1);
        document.getElementById('i_recomendacion').textContent = porcentaje(g.recomendacion);
        document.getElementById('i_amabilidad').textContent = porcentaje(g.amabilidad);
        document.getElementById('i_informacion').textContent = porcentaje(g.informacion);
        document.getElementById('i_instalaciones').textContent = numero(g.instalaciones_promedio, 1);
        document.getElementById('i_edad').textContent = numero(g.edad_promedio, 0);
    }

    // ---------- Barras de la atención ----------

    function mostrarAtencion(cantidades, total) {
        barrasAtencion.innerHTML = '';

        if (Number(total) === 0) {
            barrasAtencion.innerHTML = '<p class="sin-datos"></p>';
            barrasAtencion.querySelector('p').textContent = t('Todavía no hay encuestas respondidas.');
            return;
        }

        calificaciones.forEach((calificacion) => {
            const cantidad = Number(cantidades[calificacion] || 0);
            const ancho = Math.round(cantidad * 100 / total);

            const fila = document.createElement('div');
            fila.className = 'barra-fila';
            fila.innerHTML = `
                <span>${calificacion}</span>
                <div class="barra-fondo"><div class="barra-relleno" style="width:${ancho}%"></div></div>
                <span class="barra-cantidad">${cantidad} (${ancho}%)</span>
            `;
            barrasAtencion.appendChild(fila);
        });
    }

    // ---------- Tabla de servicios ----------

    function mostrarServicios(servicios) {
        tablaServicios.innerHTML = '';

        if (servicios.length === 0) {
            tablaServicios.innerHTML = '<tr><td colspan="5" class="sin-pacientes"></td></tr>';
            tablaServicios.querySelector('td').textContent = t('Todavía no hay encuestas respondidas.');
            return;
        }

        servicios.forEach((s) => {
            const fila = document.createElement('tr');

            // El servicio que está elegido en el filtro se resalta
            if (s.servicio === filtroServicio.value) {
                fila.style.fontWeight = 'bold';
            }

            const datos = [
                s.servicio,
                s.total,
                numero(s.atencion_promedio, 1),
                numero(s.instalaciones_promedio, 1),
                porcentaje(s.recomendacion)
            ];

            // textContent: se muestra exactamente lo guardado, sin interpretarlo como HTML
            datos.forEach((dato) => {
                const celda = document.createElement('td');
                celda.textContent = dato;
                fila.appendChild(celda);
            });

            tablaServicios.appendChild(fila);
        });
    }

    // ---------- Comentarios ----------

    function mostrarComentarios(comentarios) {
        listaComentarios.innerHTML = '';

        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p class="sin-datos"></p>';
            listaComentarios.querySelector('p').textContent = t('No hay comentarios todavía.');
            return;
        }

        comentarios.forEach((c) => {
            const caja = document.createElement('div');
            caja.className = 'comentario';

            // Los comentarios los escriben los pacientes: van con textContent para que no se ejecute nada
            const texto = document.createElement('p');
            texto.textContent = c.comentarios;

            let quien = t('Anónimo');

            if (c.nombre) {
                quien = c.nombre;
            }

            const detalle = document.createElement('small');
            detalle.textContent = quien + ' · ' + c.servicio + ' · ' + t(c.atencion) + ' · ' + fecha(c.fecha);

            caja.appendChild(texto);
            caja.appendChild(detalle);
            listaComentarios.appendChild(caja);
        });
    }

    // ---------- Pedir los resultados ----------

    async function cargarResultados() {
        let url = '../php/resultados_encuestas.php';

        if (filtroServicio.value !== '') {
            url = url + '?servicio=' + encodeURIComponent(filtroServicio.value);
        }

        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();

            if (!resultado.exito) {
                alert(t(resultado.mensaje));
                return;
            }

            mostrarGenerales(resultado.generales);
            mostrarAtencion(resultado.atencion, resultado.generales.total);
            mostrarServicios(resultado.servicios);
            mostrarComentarios(resultado.comentarios);

            // Lo que se dibujó está en español: se traduce si la página está en inglés
            traducirPagina();

        } catch (error) {
            alert(t('No se pudieron calcular los resultados de las encuestas.'));
        }
    }

    filtroServicio.addEventListener('change', cargarResultados);

    cargarResultados();
});
