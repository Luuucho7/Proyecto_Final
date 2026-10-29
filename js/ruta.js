
const campoOrigen = document.getElementById('origen');
const campoDestino = document.getElementById('destino');
const botonRuta = document.getElementById('boton_ruta');
const mensajeRuta = document.getElementById('mensaje_ruta');
const infoRuta = document.getElementById('info_ruta');

const capaRuta = L.layerGroup().addTo(mapa);

const puntos = { origen: null, destino: null };

const CENTRO_MONTEVIDEO = '-56.1645,-34.9011';



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

    return dato.results || [];
}

async function pedirDirecciones(texto) {
    const cercanas = await consultarDirecciones(texto, 'circle:' + CENTRO_MONTEVIDEO + ',40000');

    if (cercanas.length >= 5) {
        return cercanas;
    }

    const detodoelpais = await consultarDirecciones(texto, 'countrycode:uy');

    detodoelpais.forEach(direccion => {
        const repetida = cercanas.some(c => c.formatted === direccion.formatted);

        if (!repetida && cercanas.length < 5) {
            cercanas.push(direccion);
        }
    });

    return cercanas;
}

function activarAutocompletado(campo, cual) {
    const lista = campo.parentElement.querySelector('.opciones-lista');
    let espera = null;

    function mostrarMensaje(texto) {
        lista.innerHTML = '';
        const item = document.createElement('li');
        item.textContent = texto;
        item.className = 'sin-resultados';
        lista.appendChild(item);
        lista.hidden = false;
    }

    campo.addEventListener('input', () => {
        puntos[cual] = null;
        clearTimeout(espera);

        const texto = campo.value.trim();

        if (texto.length < 3) {
            lista.hidden = true;
            return;
        }

        espera = setTimeout(async () => {
            mostrarMensaje(t('Buscando...'));

            try {
                const resultados = await pedirDirecciones(texto);

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

                    item.addEventListener('mousedown', () => {
                        campo.value = resultado.formatted;
                        puntos[cual] = { lat: resultado.lat, lon: resultado.lon, formatted: resultado.formatted };
                        lista.hidden = true;

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

    campo.addEventListener('blur', () => {
        clearTimeout(espera);
        lista.hidden = true;

        if (!puntos[cual]) {
            campo.value = '';
        }
    });
}



async function buscarRuta(origen, destino) {
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



async function dibujarRuta() {

    if (!puntos.origen || !puntos.destino) {
        mensajeRuta.textContent = t('Elegí el origen y el destino de la lista para ver la ruta.');
        return;
    }

    mensajeRuta.textContent = t('Buscando la ruta...');
    botonRuta.disabled = true;

    try {
        const ruta = await buscarRuta(puntos.origen, puntos.destino);

        const dibujo = ruta.geometry.coordinates[0].map(([lon, lat]) => [lat, lon]);

        capaRuta.clearLayers();

        const linea = L.polyline(dibujo, { color: 'blue', weight: 5 }).addTo(capaRuta);
        L.marker([puntos.origen.lat, puntos.origen.lon]).bindPopup(t('Origen') + ': ' + puntos.origen.formatted).addTo(capaRuta);
        L.marker([puntos.destino.lat, puntos.destino.lon]).bindPopup(t('Destino') + ': ' + puntos.destino.formatted).addTo(capaRuta);

        mapa.fitBounds(linea.getBounds());

        mostrarDatosRuta(ruta.properties);
        mensajeRuta.textContent = '';

    } catch (error) {
        mensajeRuta.textContent = t('No se pudo calcular la ruta. Revisá tu conexión a internet.');
    } finally {
        botonRuta.disabled = false;
    }
}

function mostrarDatosRuta(datos) {
    const kilometros = (datos.distance / 1000).toFixed(1);
    const minutos = Math.round(datos.time / 60);

    document.getElementById('ruta_distancia').textContent = kilometros + ' km';
    document.getElementById('ruta_tiempo').textContent = minutos + ' min';
    infoRuta.hidden = false;
}



activarAutocompletado(campoOrigen, 'origen');
activarAutocompletado(campoDestino, 'destino');

botonRuta.addEventListener('click', dibujarRuta);

document.getElementById('form_traslado').addEventListener('reset', () => {
    puntos.origen = null;
    puntos.destino = null;
});
