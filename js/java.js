document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('btnMenu');
    const menu = document.getElementById('menuLateral');

    if (boton && menu) {
        boton.addEventListener('click', function () {
            menu.classList.toggle('activo');
        });
    }
});

function validarRegistro(event) {
    const pass = document.getElementById('password').value;
    const confirmPass = document.getElementById('confirm_password').value;
    const feedback = document.getElementById('feedback');

    // Limpiar mensaje previo
    feedback.innerText = '';

    // Regla: 8 a 16 caracteres, al menos una mayúscula y al menos un número
    const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,16}$/;

    if (!passRegex.test(pass)) {
        event.preventDefault(); // Detiene el envío del formulario
        feedback.innerText = "La contraseña debe tener entre 8 y 16 caracteres, al menos una mayúscula y un número.";
        return false;
    }

    if (pass !== confirmPass) {
        event.preventDefault(); // Detiene el envío del formulario
        feedback.innerText = "Las contraseñas no coinciden.";
        return false;
    }

    return true; // Permite enviar el formulario hacia register.php
}

document.addEventListener('DOMContentLoaded', function () {

    const password = document.getElementById('feedback-pass');
    const botonOjo = document.getElementById('mostrarPass');
    const imagenOjo = botonOjo.querySelector('img');

    botonOjo.addEventListener('click', function () {

        if (password.type === 'password') {
            password.type = 'text';
            imagenOjo.src = '../Proyecto_Final/css/img/ojo_cerrado_logo.svg';
        } else {
            password.type = 'password';
            imagenOjo.src = '../Proyecto_Final/css/img/ojo_abierto_logo.svg';
        }

    });

});