const form = document.getElementById('register-block');
const feedback = document.getElementById('feedback');

// Muestra un error debajo del formulario (en el idioma elegido)
function mostrarError(texto) {
  feedback.textContent = t(texto);
  feedback.className = "error";
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const cedula = document.getElementById('cedula').value;
  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;
  const direccion = document.getElementById('direccion').value;
  const telefono = document.getElementById('telefono').value;
  const fechaNacimiento = document.getElementById('fecha_nacimiento').value;

  if (nombre.length < 2) {
    return mostrarError("El nombre debe tener al menos 2 letras.");
  }

  if (apellido.length < 2) {
    return mostrarError("El apellido debe tener al menos 2 letras.");
  }

  const cedulaSoloNumeros = /^[0-9]+$/.test(cedula);

  if (!cedulaSoloNumeros) {
    return mostrarError("La cédula solo puede contener números.");
  }

  if (cedula.length !== 8) {
    return mostrarError("La cédula debe tener 8 números.");
  }

  const tieneArroba = correo.includes("@");
  const tienePunto = correo.includes(".");

  if (!tieneArroba || !tienePunto) {
    return mostrarError("El correo debe tener un @ y un punto. Ejemplo: nombre@correo.com");
  }

  const tieneMinuscula = /[a-z]/.test(password);
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);

  if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
    return mostrarError("La contraseña debe contener al menos una letra minúscula, una mayúscula y un número.");
  }

  if (password.length < 8 || password.length > 16) {
    return mostrarError("La contraseña debe tener entre 8 y 16 caracteres.");
  }

  if (password !== confirmPassword) {
    return mostrarError("Las contraseñas no coinciden.");
  }

  if (direccion.trim().length < 5) {
    return mostrarError("La dirección debe tener al menos 5 caracteres.");
  }

  const telefonoSoloNumeros = /^[0-9]+$/.test(telefono);

  if (!telefonoSoloNumeros) {
    return mostrarError("El teléfono solo puede contener números.");
  }

  if (telefono.length < 8 || telefono.length > 9) {
    return mostrarError("El teléfono debe tener 8 o 9 números.");
  }

  if (fechaNacimiento === "") {
    return mostrarError("Tenés que elegir tu fecha de nacimiento.");
  }

  const fechaElegida = new Date(fechaNacimiento);
  const hoy = new Date();

  if (fechaElegida > hoy) {
    return mostrarError("La fecha de nacimiento no puede ser posterior al día de hoy.");
  }

  feedback.textContent = t("Enviando...");
  feedback.className = "success";
  form.submit();
});
