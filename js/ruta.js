// ruta.js
// Origen y Destino con lista de direcciones, y camino más corto dibujado en el mapa.
// Usa dos servicios de Geoapify (la clave está en js/config.js):
//   1. Autocompletado: mientras se escribe, sugiere las direcciones que más se parecen (primero las de Montevideo).
//   2. Routing: calcula la ruta entre las dos direcciones elegidas.
// Solo vale una dirección ELEGIDA de la lista: lo que se escribe a mano y no se elige, se borra.
// "mapa" es el mapa de Leaflet que crea js/mapa.js

const campoOrigen = document.getElementById('origen');
const campoDestino = document.getElementById('destino');
const botonRuta = document.getElementById('boton_ruta');
const mensajeRuta = document.getElementById('mensaje_ruta');
const infoRuta = document.getElementById('info_ruta');

// Acá se dibuja la ruta con sus marcadores. Se vacía cada vez que se calcula una nueva
const capaRuta = L.layerGroup().addTo(mapa);

// Las direcciones elegidas de la lista, con sus coordenadas.
// null significa que todavía no se eligió ninguna
const puntos = { origen: null, destino: null };

// Centro de Montevideo (longitud,latitud): las direcciones cercanas a este punto salen primero
const CENTRO_MONTEVIDEO = '-56.1645,-34.9011';


// ---------- 1. Pedir direcciones mientras se escribe ----------

// Hace una consulta de autocompletado. "filtro" limita dónde se busca (ver más abajo)
async function consultarDirecciones(texto, filtro) {
    const url = 'https://api.geoapify.com/v1/geocode/autocomplete?' +
        'text=' + encodeURIComponent(texto) +
        '&filter=' + filtro +
        '&bias=proximity:' + CENTRO_MONTEVIDEO +
        '&lang=' + idiomaActual() +
        '&limit=5&format=json' +
        '&apiKey=' + CLAVE_GEOAPIFY;

    const respuesta = await fetch(url);
    const dato = await respuesta.json();

    // Si no encontró nada (o hubo un error), no hay "results" y devolvemos una lista vacía
    return dato.results || [];
}

async function pedirDirecciones(texto) {
    // Primero se busca solo en los alrededores de Montevideo (un círculo de 40 km)
    const cercanas = await consultarDirecciones(texto, 'circle:' + CENTRO_MONTEVIDEO + ',40000');

    if (cercanas.length >= 5) {
        return cercanas;
    }

    // Si hay pocas, se completa con direcciones de todo Uruguay (las que ya están no se repiten)
    const detodoelpais = await consultarDirecciones(texto, 'countrycode:uy');

    detodoelpais.forEach(direccion => {
        const repetida = cercanas.some(c => c.formatted === direccion.formatted);

        if (!repetida && cercanas.length < 5) {
            cercanas.push(direccion);
        }
    });

    return cercanas;
}

// Convierte un campo de texto (origen o destino) en un buscador de direcciones.
// "cual" dice si es el 'origen' o el 'destino'
function activarAutocompletado(campo, cual) {
    const lista = campo.parentElement.querySelector('.opciones-lista');
    let espera = null;

    // Muestra un texto suelto dentro de la lista ("Buscando...", "Sin resultados", etc.)
    function mostrarMensaje(texto) {
        lista.innerHTML = '';
        const item = document.createElement('li');
        item.textContent = texto;
        item.className = 'sin-resultados';
        lista.appendChild(item);
        lista.hidden = false;
    }

    campo.addEventListener('input', () => {
        // Si se cambia el texto, la dirección que se había elegido antes ya no vale
        puntos[cual] = null;
        clearTimeout(espera);

        const texto = campo.value.trim();

        if (texto.length < 3) {
            lista.hidden = true;
            return;
        }

        // Se espera 300 milisegundos desde la última tecla, para no consultar con cada letra
        espera = setTimeout(async () => {
            mostrarMensaje(t('Buscando...'));

            try {
                const resultados = await pedirDirecciones(texto);

                // Si mientras tanto se escribió otra cosa, esta respuesta ya no sirve
                if (campo.value.trim() !== texto) {
                    return;
                }

                if (resultados.length === 0) {
                    mostrarMensaje(t('Sin resultados'));
                    return;
                }

                lista.innerHTML = '';

                resultados.forEach(resultado => {
                    const item = document.createElement('li');
                    item.textContent = resultado.formatted;

                    // Se usa mousedown (y no click) para elegir antes de que el campo pierda el foco
                    item.addEventListener('mousedown', () => {
                        campo.value = resultado.formatted;
                        puntos[cual] = { lat: resultado.lat, lon: resultado.lon, formatted: resultado.formatted };
                        lista.hidden = true;

                        // Si ya están elegidos el origen y el destino, se dibuja la ruta sola
                        if (puntos.origen && puntos.destino) {
                            dibujarRuta();
                        }
                    });

                    lista.appendChild(item);
                });

                lista.hidden = false;

            } catch (error) {
                mostrarMensaje(t('No se pudo buscar. Revisá tu conexión a internet.'));
            }
        }, 300);
    });

    // Al salir del campo se cierra la lista. Si no se eligió ninguna dirección, lo escrito se borra
    campo.addEventListener('blur', () => {
        clearTimeout(espera);
        lista.hidden = true;

        if (!puntos[cual]) {
            campo.value = '';
        }
    });
}


// ---------- 2. Pedir la ruta entre los dos puntos ----------

async function buscarRuta(origen, destino) {
    // Geoapify pide primero la latitud y después la longitud. type=short: el camino de menor distancia
    const url = 'https://api.geoapify.com/v1/routing?' +
        'waypoints=' + origen.lat + ',' + origen.lon + '%7C' + destino.lat + ',' + destino.lon +
        '&mode=drive' +
        '&type=short' +
        '&units=metric' +
        '&lang=' + idiomaActual() +
        '&apiKey=' + CLAVE_GEOAPIFY;

    const respuesta = await fetch(url);
    const ruta = await respuesta.json();

    return ruta.features[0];
}


// ---------- 3. Mostrar todo en el mapa ----------

async function dibujarRuta() {

    if (!puntos.origen || !puntos.destino) {
        mensajeRuta.textContent = t('Elegí el origen y el destino de la lista para ver la ruta.');
        return;
    }

    mensajeRuta.textContent = t('Buscando la ruta...');
    botonRuta.disabled = true;

    try {
        const ruta = await buscarRuta(puntos.origen, puntos.destino);

        // La ruta viene como [longitud, latitud] y Leaflet necesita [latitud, longitud]: se dan vuelta
        const dibujo = ruta.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);

        capaRuta.clearLayers();

        const linea = L.polyline(dibujo, { color: 'blue', weight: 5 }).addTo(capaRuta);
        L.marker([puntos.origen.lat, puntos.origen.lon]).bindPopup(t('Origen') + ': ' + puntos.origen.formatted).addTo(capaRuta);
        L.marker([puntos.destino.lat, puntos.destino.lon]).bindPopup(t('Destino') + ': ' + puntos.destino.formatted).addTo(capaRuta);

        // Acerca el mapa para que se vea todo el recorrido
        mapa.fitBounds(linea.getBounds());

        mostrarDatosRuta(ruta.properties);
        mensajeRuta.textContent = '';

    } catch (error) {
        mensajeRuta.textContent = t('No se pudo calcular la ruta. Revisá tu conexión a internet.');
    } finally {
        botonRuta.disabled = false;
    }
}

// Muestra debajo del mapa la distancia y el tiempo estimado
function mostrarDatosRuta(datos) {
    const kilometros = (datos.distance / 1000).toFixed(1);
    const minutos = Math.round(datos.time / 60);

    document.getElementById('ruta_distancia').textContent = kilometros + ' km';
    document.getElementById('ruta_tiempo').textContent = minutos + ' min';
    infoRuta.hidden = false;
}


// ---------- Arranque ----------

activarAutocompletado(campoOrigen, 'origen');
activarAutocompletado(campoDestino, 'destino');

// El botón "Ver ruta" vuelve a dibujar la ruta con las direcciones elegidas
botonRuta.addEventListener('click', dibujarRuta);

// Cuando el formulario se limpia (por ejemplo, después de crear un traslado), también se olvidan las direcciones elegidas
document.getElementById('form_traslado').addEventListener('reset', () => {
    puntos.origen = null;
    puntos.destino = null;
});
