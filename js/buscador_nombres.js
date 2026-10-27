// buscador_nombres.js
// Lista desplegable con buscador para elegir un chofer o un copiloto.
// La usan Traslado.html (crear un traslado) y traslados_lista.html (modificar un traslado).
//
// Cómo se usa en cada página:
//   activarBuscador('chofer', 'chofer');       // (id del campo, rol de las personas que muestra)
//   activarBuscador('copiloto', 'copiloto');
//   cargarPersonas();                          // pide los nombres al servidor

// Acá quedan los nombres de los choferes y de los copilotos (los carga cargarPersonas)
const nombresPorRol = { chofer: [], copiloto: [] };

// Para comparar sin importar mayúsculas ni tildes: "José" y "jose" cuentan como iguales
function simplificar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Convierte un campo de texto en una lista desplegable donde se puede escribir para buscar
function activarBuscador(idCampo, rol) {
    const campo = document.getElementById(idCampo);
    const lista = campo.parentElement.querySelector('.opciones-lista');

    // Arma la lista. Si "filtrar" es true, muestra solo los nombres que contienen lo escrito
    function mostrarOpciones(filtrar) {
        const buscado = filtrar ? simplificar(campo.value) : '';
        lista.innerHTML = '';

        nombresPorRol[rol].forEach(nombre => {
            if (simplificar(nombre).includes(buscado)) {
                const opcion = document.createElement('li');
                opcion.textContent = nombre;

                // Se usa mousedown (y no click) para elegir el nombre antes de que el campo pierda el foco
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

    // Al hacer clic se ven todos los nombres; al escribir, solo los que se parecen
    campo.addEventListener('focus', () => mostrarOpciones(false));
    campo.addEventListener('click', () => mostrarOpciones(false));
    campo.addEventListener('input', () => mostrarOpciones(true));

    // Al salir del campo se cierra la lista. Como en un select, solo vale un nombre de la lista
    campo.addEventListener('blur', () => {
        lista.hidden = true;

        if (!nombresPorRol[rol].includes(campo.value)) {
            campo.value = '';
        }
    });
}

// Pide los choferes y copilotos al servidor (los que se cargan en la página "Choferes y copilotos")
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
