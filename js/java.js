document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('btnMenu');
    const menu = document.getElementById('menuLateral');

    if (boton && menu) {
        boton.addEventListener('click', function () {
            menu.classList.toggle('activo');
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {

    const password = document.getElementById('feedback-pass');
    const botonOjo = document.getElementById('mostrarPass');

    if (!password || !botonOjo) return;

    const imagenOjo = botonOjo.querySelector('img');

    botonOjo.addEventListener('click', function () {

        if (password.type === 'password') {
            password.type = 'text';
            imagenOjo.src = imagenOjo.src.replace('ojo_abierto_logo.svg', 'ojo_cerrado_logo.svg');
        } else {
            password.type = 'password';
            imagenOjo.src = imagenOjo.src.replace('ojo_cerrado_logo.svg', 'ojo_abierto_logo.svg');
        }

    });

});