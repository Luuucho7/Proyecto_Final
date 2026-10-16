<?php

// session_start() habilita $_SESSION: así el servidor "recuerda" quién sos entre una página y otra
session_start();

// Le avisamos al navegador que la respuesta va a ser JSON, no HTML
header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

// Este archivo solo debe usarse cuando index.js manda el formulario por POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Acceso no permitido.'
    ]);
    exit();
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Validación del lado del servidor: aunque el JS ya revisó esto, nunca hay que confiar solo en el navegador
if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, ingresa tu usuario y contraseña.'
    ]);
    exit();
}

try {

    // Busca la persona por cédula O por correo, según qué haya escrito el usuario
    $stmt = $pdo->prepare("SELECT * FROM Persona WHERE cedula = :username OR correo = :username");
    $stmt->execute([':username' => $username]);
    $usuario = $stmt->fetch();

    // password_verify compara la contraseña escrita contra el hash guardado, sin necesidad de "desencriptarlo"
    if ($usuario && password_verify($password, $usuario['password_hash'])) {

        // Login correcto: guardamos estos datos en la sesión para las próximas páginas
        $_SESSION['usuario_cedula'] = $usuario['cedula'];
        $_SESSION['usuario_correo'] = $usuario['correo'];

        echo json_encode([
            'success'  => true,
            'message'  => 'Ingreso correcto. Redirigiendo...',
            'redirect' => 'html/pagina_principal.html'
        ]);
        exit();
    }

    // Ni la cédula/correo, ni la contraseña, ni ambas coinciden: mismo mensaje genérico por seguridad
    echo json_encode([
        'success' => false,
        'message' => 'Cédula/correo o contraseña incorrectos.'
    ]);
    exit();

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Error en el inicio de sesión. Intentá más tarde.'
    ]);
    exit();
}
