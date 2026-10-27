// ruta.js
// Dibuja en el mapa el camino más corto entre el Origen y el Destino del formulario de Traslado.
// Usa dos servicios de Geoapify (la clave está en js/config.js):
//   1. Geocoding: convierte una dirección escrita en coordenadas (latitud y longitud).
//   2. Routing: calcula la ruta entre dos coordenadas.
// "mapa" es el mapa de Leaflet que crea js/mapa.js

const campoOrigen = document.getElementById('origen');
const campoDestino = document.getElementById('destino');
const botonRuta = document.getElementById('boton_ruta');
const mensajeRuta = document.getElementById('mensaje_ruta');
const infoRuta = document.getElementById('info_ruta');

// Acá se dibuja la ruta con sus marcadores. Se vacía cada vez que se calcula una nueva
const capaRuta = L.layerGroup().addTo(mapa);


// ---------- 1. Dirección -> coordenadas ----------

async function buscarDireccion(direccion) {
    // Se le agrega Uruguay al texto y se filtra por país, así no confunde la dirección con otro lugar
    const texto = direccion + ', Uruguay';

    const url = 'https://api.geoapify.com/v1/geocode/search?' +
        'text=' + encodeURIComponent(texto) +
        '&filter=countrycode:uy' +
        '&lang=' + idiomaActual() +
        '&limit=1&format=json' +
        '&apiKey=' + CLAVE_GEOAPIFY;

    const respuesta = await fetch(url);
    const dato = await respuesta.json();

    // Si no encontró nada, results está vacío y esto da undefined
    return dato.results[0];
}


// ---------- 2. Coordenadas -> ruta ----------

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

    const textoOrigen = campoOrigen.value.trim();
    const textoDestino = campoDestino.value.trim();

    if (textoOrigen === '' || textoDestino === '') {
        mensajeRuta.textContent = t('Escribí el origen y el destino para ver la ruta.');
        return;
    }

    mensajeRuta.textContent = t('Buscando la ruta...');
    botonRuta.disabled = true;

    try {
        const puntoOrigen = await buscarDireccion(textoOrigen);
        const puntoDestino = await buscarDireccion(textoDestino);

        if (!puntoOrigen) {
            mensajeRuta.textContent = t('No se encontró el origen.');
            return;
        }

        if (!puntoDestino) {
            mensajeRuta.textContent = t('No se encontró el destino.');
            return;
        }

        const ruta = await buscarRuta(puntoOrigen, puntoDestino);

        // La ruta viene como [longitud, latitud] y Leaflet necesita [latitud, longitud]: se dan vuelta
        const dibujo = ruta.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);

        capaRuta.clearLayers();

        const linea = L.polyline(dibujo, { color: 'blue', weight: 5 }).addTo(capaRuta);
        L.marker([puntoOrigen.lat, puntoOrigen.lon]).bindPopup(t('Origen') + ': ' + puntoOrigen.formatted).addTo(capaRuta);
        L.marker([puntoDestino.lat, puntoDestino.lon]).bindPopup(t('Destino') + ': ' + puntoDestino.formatted).addTo(capaRuta);

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

// Muestra debajo del mapa la distancia, el tiempo y las indicaciones paso a paso
function mostrarDatosRuta(datos) {
    const kilometros = (datos.distance / 1000).toFixed(1);
    const minutos = Math.round(datos.time / 60);

    document.getElementById('ruta_distancia').textContent = kilometros + ' km';
    document.getElementById('ruta_tiempo').textContent = minutos + ' min';

    const lista = document.getElementById('pasos_ruta');
    lista.innerHTML = '';

    datos.legs[0].steps.forEach(paso => {
        const item = document.createElement('li');
        item.textContent = paso.instruction.text + ' (' + paso.distance + ' m)';
        lista.appendChild(item);
    });

    infoRuta.hidden = false;
}


// ---------- Cuándo se dibuja ----------

// Al apretar el botón "Ver ruta"
botonRuta.addEventListener('click', dibujarRuta);

// Y también solo, cuando se termina de escribir el origen o el destino y los dos tienen algo
campoOrigen.addEventListener('change', () => {
    if (campoDestino.value.trim() !== '') dibujarRuta();
});

campoDestino.addEventListener('change', () => {
    if (campoOrigen.value.trim() !== '') dibujarRuta();
});
