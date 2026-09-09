const form = document.getElementById('register-block');
const feedback = document.getElementById('feedback');

// Escucha el envío del formulario
form.addEventListener('submit', function (event) {
  event.preventDefault(); // Evita que el formulario se envíe sin validar

  // Valores que escribió el usuario
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const cedula = document.getElementById('cedula').value;
  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  const direccion = document.getElementById('direccion').value;
  const telefono = document.getElementById('telefono').value;
  const fechaNacimiento = document.getElementById('fecha_nacimiento').value;

  // === VALIDACIÓN DEL NOMBRE ===
  if (nombre.length < 2) {
    feedback.textContent = "El nombre debe tener al menos 2 letras.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DEL APELLIDO ===
  if (apellido.length < 2) {
    feedback.textContent = "El apellido debe tener al menos 2 letras.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DE LA CÉDULA ===
  const cedulaSoloNumeros = /^[0-9]+$/.test(cedula); // Solo puede tener números

  if (!cedulaSoloNumeros) {
    feedback.textContent = "La cédula solo puede contener números.";
    feedback.className = "error";
    return;
  }

  if (cedula.length !== 8) {
    feedback.textContent = "La cédula debe tener 8 números.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DEL CORREO ===
  const tieneArroba = correo.includes("@"); // Tiene que llevar arroba
  const tienePunto = correo.includes(".");  // Tiene que llevar punto

  if (!tieneArroba || !tienePunto) {
    feedback.textContent = "El correo debe tener un @ y un punto. Ejemplo: nombre@correo.com";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DE LA CONTRASEÑA ===
  const tieneMinuscula = /[a-z]/.test(password);
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);

  if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
    feedback.textContent =
      "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número.";
    feedback.className = "error";
    return;
  }

  if (password.length < 8 || password.length > 16) {
    feedback.textContent = "La contraseña debe tener entre 8 y 16 caracteres.";
    feedback.className = "error";
    return;
  }

  // === LAS DOS CONTRASEÑAS TIENEN QUE SER IGUALES ===
  if (password !== confirmPassword) {
    feedback.textContent = "Las contraseñas no coinciden.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DE LA DIRECCIÓN ===
  if (direccion.trim().length < 5) {
    feedback.textContent = "La dirección debe tener al menos 5 caracteres.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DEL TELÉFONO ===
  const telefonoSoloNumeros = /^[0-9]+$/.test(telefono);

  if (!telefonoSoloNumeros) {
    feedback.textContent = "El teléfono solo puede contener números.";
    feedback.className = "error";
    return;
  }

  if (telefono.length < 8 || telefono.length > 9) {
    feedback.textContent = "El teléfono debe tener 8 o 9 números.";
    feedback.className = "error";
    return;
  }

  // === VALIDACIÓN DE LA FECHA DE NACIMIENTO ===
  if (fechaNacimiento === "") {
    feedback.textContent = "Tenés que elegir tu fecha de nacimiento.";
    feedback.className = "error";
    return;
  }

  const fechaElegida = new Date(fechaNacimiento);
  const hoy = new Date();

  if (fechaElegida > hoy) {
    feedback.textContent = "La fecha de nacimiento no puede ser posterior al día de hoy.";
    feedback.className = "error";
    return;
  }

  // Si pasó todas las validaciones, enviamos el formulario a php/register.php
  feedback.textContent = "Enviando...";
  feedback.className = "success";
  form.submit();
});