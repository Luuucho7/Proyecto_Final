<?php

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Acceso no permitido.'
    ]);
    exit();
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, ingresa tu usuario y contraseña.'
    ]);
    exit();
}

try {

    $stmt = $pdo->prepare("SELECT * FROM Persona WHERE cedula = :username OR correo = :username");
    $stmt->execute([':username' => $username]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($password, $usuario['password_hash'])) {

        $_SESSION['usuario_cedula'] = $usuario['cedula'];
        $_SESSION['usuario_correo'] = $usuario['correo'];

        echo json_encode([
            'success'  => true,
            'message'  => 'Ingreso correcto. Redirigiendo...',
            'redirect' => 'html/pagina_principal.html'
        ]);
        exit();
    }

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
