
const rutaJson = new URL('../json/ingles.json', document.currentScript.src);

let diccionario = {};

const tituloOriginal = document.title;



function idiomaActual() {
    return localStorage.getItem('idioma') || 'es';
}

function limpiar(texto) {
    return texto.replace(/\s+/g, ' ').trim();
}

function t(texto) {
    if (idiomaActual() === 'en' && diccionario[texto]) {
        return diccionario[texto];
    }
    return texto;
}



function traducirPagina() {

    const idioma = idiomaActual();

    document.documentElement.lang = idioma;
    document.getElementById('botonIdioma').textContent = (idioma === 'es') ? 'English' : 'Español';

    document.querySelectorAll('body *').forEach(function (elemento) {

        if (elemento.children.length > 0 || elemento.tagName === 'SCRIPT' || elemento.tagName === 'STYLE' || elemento.id === 'botonIdioma') {
            return;
        }

        const texto = limpiar(elemento.textContent);

        if (idioma === 'en' && diccionario[texto]) {
            elemento.dataset.es = texto;
            elemento.textContent = diccionario[texto];
        }

        if (idioma === 'es' && elemento.dataset.es && texto === diccionario[elemento.dataset.es]) {
            elemento.textContent = elemento.dataset.es;
        }
    });

    document.querySelectorAll('[placeholder]').forEach(function (campo) {

        if (idioma === 'en' && diccionario[campo.placeholder]) {
            campo.dataset.esPlaceholder = campo.placeholder;
            campo.placeholder = diccionario[campo.placeholder];
        }

        if (idioma === 'es' && campo.dataset.esPlaceholder) {
            campo.placeholder = campo.dataset.esPlaceholder;
        }
    });

    if (idioma === 'en' && diccionario[tituloOriginal]) {
        document.title = diccionario[tituloOriginal];
    } else {
        document.title = tituloOriginal;
    }
}



function crearBoton() {

    const boton = document.createElement('button');
    boton.id = 'botonIdioma';
    boton.type = 'button';
    boton.textContent = (idiomaActual() === 'es') ? 'English' : 'Español';

    boton.style.cssText = 'background: #ffffff; color: #0b5fff; font-size: 14px; font-weight: bold; ' +
        'padding: 8px 16px; border: none; border-radius: 20px; cursor: pointer; ' +
        'box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);';

    boton.addEventListener('click', function () {

        const nuevoIdioma = (idiomaActual() === 'es') ? 'en' : 'es';

        localStorage.setItem('idioma', nuevoIdioma);
        document.cookie = 'idioma=' + nuevoIdioma + '; path=/';

        traducirPagina();

        document.dispatchEvent(new Event('cambioIdioma'));
    });

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



crearBoton();

fetch(rutaJson)
    .then(function (respuesta) {
        return respuesta.json();
    })
    .then(function (datos) {
        diccionario = datos;
        traducirPagina();
        document.dispatchEvent(new Event('cambioIdioma'));
    });
