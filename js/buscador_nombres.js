
const nombresPorRol = { chofer: [], copiloto: [] };

function simplificar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function activarBuscador(idCampo, rol) {
    const campo = document.getElementById(idCampo);
    const lista = campo.parentElement.querySelector('.opciones-lista');

    function mostrarOpciones(filtrar) {
        const buscado = filtrar ? simplificar(campo.value) : '';
        lista.innerHTML = '';

        nombresPorRol[rol].forEach(nombre => {
            if (simplificar(nombre).includes(buscado)) {
                const opcion = document.createElement('li');
                opcion.textContent = nombre;

                opcion.addEventListener('mousedown', () => {
                    campo.value = nombre;
                    lista.hidden = true;
                });

                lista.appendChild(opcion);
            }
        });

        if (lista.children.length === 0) {
            const vacio = document.createElement('li');
            vacio.textContent = t('Sin resultados');
            vacio.className = 'sin-resultados';
            lista.appendChild(vacio);
        }

        lista.hidden = false;
    }

    campo.addEventListener('focus', () => mostrarOpciones(false));
    campo.addEventListener('click', () => mostrarOpciones(false));
    campo.addEventListener('input', () => mostrarOpciones(true));

    campo.addEventListener('blur', () => {
        lista.hidden = true;

        if (!nombresPorRol[rol].includes(campo.value)) {
            campo.value = '';
        }
    });
}

async function cargarPersonas() {
    const respuesta = await fetch('../php/listar_tripulacion.php');
    const resultado = await respuesta.json();

    if (!resultado.exito) {
        return;
    }

    resultado.tripulantes.forEach(persona => {
        nombresPorRol[persona.rol].push(persona.nombre);
    });
}
