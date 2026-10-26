// idioma.js
// Traduce la página de español a inglés (y de inglés a español) con un botón.
// Las traducciones están en json/ingles.json: a la izquierda el texto en español
// y a la derecha su versión en inglés.
// El idioma elegido se guarda en el navegador, así que sigue igual al cambiar de página.

// Dirección del JSON, calculada a partir de la dirección de este mismo archivo.
// Así funciona igual desde index.html, desde la carpeta html/ y desde php/.
const rutaJson = new URL('../json/ingles.json', document.currentScript.src);

// Acá se guardan las traducciones cuando se termina de leer el JSON
let diccionario = {};

// El título de la pestaña, en español, tal como está escrito en la página
const tituloOriginal = document.title;


// ---------- Funciones chicas ----------

// Devuelve 'es' o 'en' (si nunca se eligió nada, es español)
function idiomaActual() {
    return localStorage.getItem('idioma') || 'es';
}

// Saca los saltos de línea y espacios de más: "Hola   \n  mundo" queda "Hola mundo"
function limpiar(texto) {
    return texto.replace(/\s+/g, ' ').trim();
}

// Para mensajes que se muestran con alert() o se escriben desde JavaScript.
// Uso: alert(t('Paciente guardado correctamente'));
// Si el idioma es inglés y hay traducción, devuelve el inglés; si no, el mismo texto.
function t(texto) {
    if (idiomaActual() === 'en' && diccionario[texto]) {
        return diccionario[texto];
    }
    return texto;
}


// ---------- Traducir toda la página ----------

function traducirPagina() {

    const idioma = idiomaActual();

    document.documentElement.lang = idioma;
    document.getElementById('botonIdioma').textContent = (idioma === 'es') ? 'English' : 'Español';

    // 1. Textos: se revisan solo los elementos que no tienen otros elementos adentro
    document.querySelectorAll('body *').forEach(function (elemento) {

        if (elemento.children.length > 0 || elemento.tagName === 'SCRIPT' || elemento.tagName === 'STYLE' || elemento.id === 'botonIdioma') {
            return;
        }

        const texto = limpiar(elemento.textContent);

        if (idioma === 'en' && diccionario[texto]) {
            // Guardamos el texto en español para poder volver a él después
            elemento.dataset.es = texto;
            elemento.textContent = diccionario[texto];
        }

        // Al volver a español solo se cambia si el texto sigue siendo el que pusimos nosotros
        if (idioma === 'es' && elemento.dataset.es && texto === diccionario[elemento.dataset.es]) {
            elemento.textContent = elemento.dataset.es;
        }
    });

    // 2. Los textos de ayuda dentro de los campos (placeholder)
    document.querySelectorAll('[placeholder]').forEach(function (campo) {

        if (idioma === 'en' && diccionario[campo.placeholder]) {
            campo.dataset.esPlaceholder = campo.placeholder;
            campo.placeholder = diccionario[campo.placeholder];
        }

        if (idioma === 'es' && campo.dataset.esPlaceholder) {
            campo.placeholder = campo.dataset.esPlaceholder;
        }
    });

    // 3. El título de la pestaña
    if (idioma === 'en' && diccionario[tituloOriginal]) {
        document.title = diccionario[tituloOriginal];
    } else {
        document.title = tituloOriginal;
    }
}


// ---------- El botón para cambiar de idioma ----------

function crearBoton() {

    const boton = document.createElement('button');
    boton.id = 'botonIdioma';
    boton.type = 'button';
    boton.textContent = (idiomaActual() === 'es') ? 'English' : 'Español';

    // Estilo: fondo blanco, bordes redondeados, texto azul
    boton.style.cssText = 'background: #ffffff; color: #0b5fff; font-size: 14px; font-weight: bold; ' +
        'padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; ' +
        'box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);';

    boton.addEventListener('click', function () {

        const nuevoIdioma = (idiomaActual() === 'es') ? 'en' : 'es';

        localStorage.setItem('idioma', nuevoIdioma);
        // También lo guardamos como cookie para que PHP sepa qué idioma se eligió
        document.cookie = 'idioma=' + nuevoIdioma + '; path=/';

        traducirPagina();
    });

    // Va arriba a la derecha, en el banner. Si la página no tiene banner, queda flotando en la esquina
    let lugar = document.querySelector('.banner-derecha') || document.querySelector('.encabezado');

    if (lugar) {
        lugar.appendChild(boton);
    } else {
        boton.style.position = 'fixed';
        boton.style.top = '12px';
        boton.style.right = '12px';
        document.body.appendChild(boton);
    }
}


// ---------- Arranque ----------

crearBoton();

// Leemos el JSON y, cuando llega, traducimos la página
fetch(rutaJson)
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (datos) {
        diccionario = datos;
        traducirPagina();
    });
