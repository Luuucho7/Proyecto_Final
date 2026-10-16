// Este archivo se incluye en varias páginas distintas. Cada bloque revisa primero
// si los elementos que necesita existen en ESA página, así no rompe nada donde no aplica.

// Bloque 1: abrir/cerrar el menú lateral (el botón ☰ de tres rayitas)
document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('btnMenu');
    const menu = document.getElementById('menuLateral');

    if (boton && menu) {
        boton.addEventListener('click', function () {
            // Alterna la clase CSS "activo": el CSS es el que decide cómo se ve el menú abierto/cerrado
            menu.classList.toggle('activo');
        });
    }
});

// Bloque 2: mostrar/ocultar la contraseña con el ícono del ojito (usado en el login)
document.addEventListener('DOMContentLoaded', function () {

    const password = document.getElementById('feedback-pass');
    const botonOjo = document.getElementById('mostrarPass');

    if (!password || !botonOjo) return;

    const imagenOjo = botonOjo.querySelector('img');

    botonOjo.addEventListener('click', function () {

        // Cambiar el "type" del input es lo que hace que el navegador muestre
        // el texto en claro (type="text") o lo tape con puntitos (type="password")
        if (password.type === 'password') {
            password.type = 'text';
            imagenOjo.src = imagenOjo.src.replace('ojo_abierto_logo.svg', 'ojo_cerrado_logo.svg');
        } else {
            password.type = 'password';
            imagenOjo.src = imagenOjo.src.replace('ojo_cerrado_logo.svg', 'ojo_abierto_logo.svg');
        }

    });

});