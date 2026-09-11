<?php

// Este archivo recibe el usuario y la contraseña que manda js/index.js
// y siempre responde en formato JSON, así el JavaScript puede leer el resultado.

session_start();

// Le avisamos al navegador que lo que devolvemos es JSON, no HTML
header('Content-Type: application/json; charset=utf-8');

require_once 'conexion.php';

// 1. Solo aceptamos datos enviados por POST (desde el formulario)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Acceso no permitido.'
    ]);
    exit();
}

// 2. Tomamos los datos del formulario
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// 3. Controlamos que no vengan vacíos
if ($username === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Por favor, ingresa tu usuario y contraseña.'
    ]);
    exit();
}

try {

    // 4. Buscamos al usuario por cédula o por correo
    $stmt = $pdo->prepare("SELECT * FROM Persona WHERE cedula = :username OR correo = :username");
    $stmt->execute([':username' => $username]);
    $usuario = $stmt->fetch();

    // 5. Verificamos que exista y que la contraseña coincida con el hash guardado
    if ($usuario && password_verify($password, $usuario['password_hash'])) {

        // 6. Guardamos los datos del usuario en la sesión
        $_SESSION['usuario_cedula'] = $usuario['cedula'];
        $_SESSION['usuario_correo'] = $usuario['correo'];

        // 7. Le devolvemos al JavaScript a qué página tiene que ir
        //    (la ruta es desde index.html, que está en la raíz del proyecto)
        echo json_encode([
            'success'  => true,
            'message'  => 'Ingreso correcto. Redirigiendo...',
            'redirect' => 'html/pagina_principal.html'
        ]);
        exit();
    }

    // 8. Si no coincide, avisamos sin decir cuál de los dos datos está mal
    echo json_encode([
        'success' => false,
        'message' => 'Cédula/correo o contraseña incorrectos.'
    ]);
    exit();

} catch (PDOException $e) {

    // 9. Si falla la consulta a la base, respondemos igual en JSON
    echo json_encode([
        'success' => false,
        'message' => 'Error en el inicio de sesión. Intentá más tarde.'
    ]);
    exit();
}
