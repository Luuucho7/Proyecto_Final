<?php
// login_funcionario.php
// Es igual que login.php, pero además revisa que la persona sea FUNCIONARIO
// (que su cédula esté en la tabla Funcionario). Si lo es, la manda al panel admin.

session_start();

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

    // JOIN une las dos tablas: solo aparece la persona si su cédula también está en Funcionario
    $stmt = $pdo->prepare("SELECT Persona.* FROM Persona
                           JOIN Funcionario ON Funcionario.cedula = Persona.cedula
                           WHERE Persona.cedula = :username OR Persona.correo = :username");
    $stmt->execute([':username' => $username]);
    $funcionario = $stmt->fetch();

    if ($funcionario && password_verify($password, $funcionario['password_hash'])) {

        $_SESSION['usuario_cedula'] = $funcionario['cedula'];
        $_SESSION['usuario_correo'] = $funcionario['correo'];

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
