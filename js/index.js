// Este archivo controla el formulario de inicio de sesión (index.html)

const formulario = document.getElementById('register-block');
const feedback = document.getElementById('feedback');

// Cuando el usuario aprieta "Enviar"
formulario.addEventListener('submit', async function (event) {

  // Frenamos el envío normal del formulario.
  // Los datos los vamos a mandar nosotros con JavaScript, sin recargar la página.
  event.preventDefault();

  // Tomamos lo que se escribió en los dos campos
  const usuario = document.getElementById('feedback-user').value;
  const contrasena = document.getElementById('feedback-pass').value;

  // Revisamos que no estén vacíos
  if (usuario === "" || contrasena === "") {
    feedback.textContent = "Tenés que completar la cédula o correo y la contraseña.";
    feedback.className = "error";
    return;
  }

  // Juntamos los datos que le vamos a enviar a login.php
  const datos = new FormData();
  datos.append("username", usuario);
  datos.append("password", contrasena);

  // Enviamos los datos a login.php y esperamos la respuesta del servidor
  const respuesta = await fetch("php/login.php", {
    method: "POST",
    body: datos
  });

  // login.php responde en formato JSON.
  // Lo convertimos en un objeto de JavaScript para poder usarlo.
  const resultado = await respuesta.json();

  // Mostramos el mensaje que mandó el servidor
  feedback.textContent = resultado.message;

  if (resultado.success === true) {
    // Datos correctos: vamos a la página que indicó el servidor
    feedback.className = "success";
    window.location.href = resultado.redirect;
  } else {
    // Datos incorrectos: dejamos el mensaje de error a la vista
    feedback.className = "error";
  }
});