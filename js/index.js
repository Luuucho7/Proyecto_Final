// Lógica del formulario de inicio de sesión (index.html)
const formulario = document.getElementById('register-block');
const feedback = document.getElementById('feedback');

formulario.addEventListener('submit', async function (event) {

  event.preventDefault(); // frena el envío normal, lo mandamos nosotros con fetch

  const usuario = document.getElementById('feedback-user').value;
  const contrasena = document.getElementById('feedback-pass').value;

  // Validación simple antes de gastar un viaje al servidor
  if (usuario === "" || contrasena === "") {
    feedback.textContent = "Tenés que completar la cédula o correo y la contraseña.";
    feedback.className = "error";
    return;
  }

  const datos = new FormData();
  datos.append("username", usuario);
  datos.append("password", contrasena);

  // Manda los datos a login.php sin recargar la página
  const respuesta = await fetch("php/login.php", {
    method: "POST",
    body: datos
  });

  const resultado = await respuesta.json();

  feedback.textContent = resultado.message;

  if (resultado.success === true) {
    feedback.className = "success";
    // Login correcto: login.php nos dice a qué página redirigir
    window.location.href = resultado.redirect;
  } else {
    feedback.className = "error";
  }
});
