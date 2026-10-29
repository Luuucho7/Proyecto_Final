<?php

header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, ingresá tu usuario y contraseña.'
    ]);
    exit();
}

try {

    if (ctype_digit($username)) {
        $condicion = "Persona.cedula = :username";
    } else {
        $condicion = "Persona.correo = :username";
    }

    $stmt = $pdo->prepare("SELECT Persona.* FROM Persona
                           JOIN Funcionario ON Funcionario.cedula = Persona.cedula
                           WHERE " . $condicion);
    $stmt->execute([':username' => $username]);
    $funcionario = $stmt->fetch();

    if ($funcionario && password_verify($password, $funcionario['password_hash'])) {

        echo json_encode([
            'success'  => true,
            'message'  => 'Ingreso correcto. Redirigiendo...',
            'redirect' => 'pagina_principal_admin.html'
        ]);
        exit();
    }

    echo json_encode([
        'success' => false,
        'message' => 'Datos incorrectos o la cuenta no es de funcionario.'
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'success' => false,
        'message' => 'Error en el inicio de sesión. Intentá más tarde.'
    ]);
}
