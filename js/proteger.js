// proteger.js
// Va en las páginas que solo puede ver un funcionario (panel, pacientes, traslados, etc.).
// Le pregunta al servidor (php/sesion.php) si hay un funcionario logueado. Si no hay, lo manda al login.

async function revisarSesion() {
    try {
        const respuesta = await fetch('../php/sesion.php');
        const resultado = await respuesta.json();

        if (resultado.logueado !== true) {
            window.location.href = 'login_funcionario.html';
        }
    } catch (error) {
        // Si no se pudo preguntar, por las dudas también se manda al login
        window.location.href = 'login_funcionario.html';
    }
}

// Se usa "pageshow" (y no solo la carga normal) porque también se dispara cuando se vuelve
// con el botón "Atrás" del navegador. Así, después de cerrar sesión, "Atrás" no muestra el panel.
window.addEventListener('pageshow', revisarSesion);
