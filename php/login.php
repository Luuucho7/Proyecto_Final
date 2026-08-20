<?php

$host = 'localhost';
$dbname = 'hospital_clinicas'; 
$username = 'root';                    
$password = ''; 


session_start();
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo "<script>
                alert('Por favor, ingresa tu usuario y contraseña.');
                window.history.back();
              </script>";
        exit();
    }

    try {
        // Buscar al usuario por cédula o por correo
        $stmt = $pdo->prepare("SELECT * FROM Persona WHERE cedula = :username OR correo = :username");
        $stmt->execute([':username' => $username]);
        $usuario = $stmt->fetch();

        // Verificar si existe el usuario y si la contraseña coincide con el hash
        if ($usuario && password_verify($password, $usuario['password_hash'])) {
            // Guardar datos clave en la sesión
            $_SESSION['usuario_cedula'] = $usuario['cedula'];
            $_SESSION['usuario_correo'] = $usuario['correo'];

            // Redirigir a la página principal de tu sistema
            header("Location: ../html/pagina_principal.html");
            exit();
        } else {
            echo "<script>
                    alert('Cédula/correo o contraseña incorrectos.');
                    window.history.back();
                  </script>";
            exit();
        }

    } catch (PDOException $e) {
        die("Error en el inicio de sesión: " . $e->getMessage());
    }
} else {
    header("Location: ../index.html");
    exit();
}
?>