const form = document.getElementById('register-block');
const feedback = document.getElementById('feedback');

// Escucha el envio del formulario
form.addEventListener('submit', function (event) {
  event.preventDefault(); // Evita que el formulario se envie sin validar

  // Valores que escribio el usuario
  const cedula = document.getElementById('cedula').value;
  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  const direccion = document.getElementById('direccion').value;
  const telefono = document.getElementById('telefono').value;
  const fechaNacimiento = document.getElementById('fecha_nacimiento').value;

  // === VALIDACION DE LA CEDULA ===
  const cedulaSoloNumeros = /^[0-9]+$/.test(cedula); // Solo puede tener numeros

  if (!cedulaSoloNumeros) {
    feedback.textContent = "La cedula solo puede contener numeros.";
    feedback.className = "error";
    return; // Corta la funcion si la validacion falla
  }

  if (cedula.length !== 8) {
    feedback.textContent = "La cedula debe tener 8 numeros.";
    feedback.className = "error";
    return;
  }

  // === VALIDACION DEL CORREO ===
  const tieneArroba = correo.includes("@"); // Tiene que llevar arroba
  const tienePunto = correo.includes(".");  // Tiene que llevar punto

  if (!tieneArroba || !tienePunto) {
    feedback.textContent = "El correo debe tener un @ y un punto. Ejemplo: nombre@correo.com";
    feedback.className = "error";
    return;
  }

  // === VALIDACION DE LA CONTRASEÑA ===
  const hasLowercase = /[a-z]/.test(password); // Al menos una minuscula
  const hasUppercase = /[A-Z]/.test(password); // Al menos una mayuscula
  const hasDigit = /[0-9]/.test(password);     // Al menos un numero

  if (!hasLowercase || !hasUppercase || !hasDigit) {
    feedback.textContent =
      "La contraseña debe contener al menos una letra minuscula, una letra mayuscula y un numero.";
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

  // === VALIDACION DE LA DIRECCION ===
  if (direccion.trim().length < 5) {
    feedback.textContent = "La direccion debe tener al menos 5 caracteres.";
    feedback.className = "error";
    return;
  }

  // === VALIDACION DEL TELEFONO ===
  const telefonoSoloNumeros = /^[0-9]+$/.test(telefono); // Solo numeros

  if (!telefonoSoloNumeros) {
    feedback.textContent = "El telefono solo puede contener numeros.";
    feedback.className = "error";
    return;
  }

  if (telefono.length < 8 || telefono.length > 9) {
    feedback.textContent = "El telefono debe tener 8 o 9 numeros.";
    feedback.className = "error";
    return;
  }

  // === VALIDACION DE LA FECHA DE NACIMIENTO ===
  if (fechaNacimiento === "") {
    feedback.textContent = "Tenes que elegir tu fecha de nacimiento.";
    feedback.className = "error";
    return;
  }

  const fechaElegida = new Date(fechaNacimiento);
  const hoy = new Date();

  if (fechaElegida > hoy) {
    feedback.textContent = "La fecha de nacimiento no puede ser posterior al dia de hoy.";
    feedback.className = "error";
    return;
  }

  // Si todos los campos son validos se envia el formulario a php/register.php
  feedback.textContent = "¡Registro exitoso!";
  feedback.className = "success";
  form.submit();

});
