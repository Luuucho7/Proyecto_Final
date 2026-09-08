  const form = document.getElementById('register-block');
    const feedback = document.getElementById('feedback');

    // Add an event listener for form submission
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevents user from submitting an empty form

      // Get the values entered by the user
      const username = document.getElementById('feedback-user').value;
      const password = document.getElementById('feedback-pass').value;

      // === USERNAME VALIDATION ===
      const hasLetter = /[a-zA-Z]/.test(username); // Checks for at least one letter
      const hasNumber = /[0-9]/.test(username);    // Checks for at least one number

      if (!hasLetter || !hasNumber) {
        feedback.textContent = "El nombre de usuario debe contener al menos una letra y un numero.";
        feedback.className = "error";
        return; // Stop the function if validation fails
      }

      // === PASSWORD VALIDATION ===
      const hasLowercase = /[a-z]/.test(password);       // At least one lowercase
      const hasUppercase = /[A-Z]/.test(password);       // At least one uppercase
      const hasDigit = /[0-9]/.test(password);        // At least one number
     

      // Combine all password requirements
      if (!hasLowercase || !hasUppercase || !hasDigit) {
        feedback.textContent =
          "La contraseña de contener al menos una letra minuscula, una letra mayuscula y un numero .";
        feedback.className = "error";
        return;
      }

      

      if (username.length < 5 || username.length > 16) {
  feedback.textContent = "El nombre de usuario debe tener entre 5 y 16 caracteres.";
  feedback.className = "error";
  return;
}

// === PASSWORD LENGTH VALIDATION ===
if (password.length < 8 || password.length > 20) {
  feedback.textContent = "La contraseña debe tener entre 8 y 20 caracteres.";
  feedback.className = "error";
  return;

}

// If both username and password are valid
      feedback.textContent  = "¡Registro exitoso!";
      feedback.className = "success";
      form.submit();
      
    });

 // Function to see and hide the password
function togglePassword() {
  const passInput = document.getElementById("feedback-pass");
  passInput.type = passInput.type === "password" ? "text" : "password";
}