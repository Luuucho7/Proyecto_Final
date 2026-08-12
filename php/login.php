<?php
session_start();
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usernameInput = trim($_POST['username'] ?? ''); // Puede ser Cédula o Correo
    $passwordInput = $_POST['password'] ?? '';

    if (empty($usernameInput) || empty($passwordInput)) {
        die("Por favor, completa todos los campos.");
    }

    try {
        // Buscar usuario por Cédula o Correo
        $stmt = $pdo->prepare("SELECT cedula, correo, password_hash FROM Persona WHERE cedula = :input OR correo = :input");
        $stmt->execute([':input' => $usernameInput]);
        $usuario = $stmt->fetch();

        if ($usuario && password_verify($passwordInput, $usuario['password_hash'])) {
            // Regenerar ID de sesión para prevenir Session Fixation
            session_regenerate_id(true);

            // Guardar datos en la sesión
            $_SESSION['usuario_cedula'] = $usuario['cedula'];
            $_SESSION['usuario_correo'] = $usuario['correo'];

            // Redireccionar a la pantalla principal o dashboard
            header("Location: index.html");
            exit();
        } else {
            // Datos incorrectos
            echo "<script>
                    alert('Cédula/Correo o contraseña incorrectos.');
                    window.location.href = 'index.html';
                  </script>";
            exit();
        }

    } catch (PDOException $e) {
        die("Error al iniciar sesión: " . $e->getMessage());
    }
} else {
    header("Location: index.html");
    exit();
}
?>