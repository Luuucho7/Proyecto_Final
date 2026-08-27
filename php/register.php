 <?php
session_start();
// Se incluye directamente porque está en la misma carpeta php/
require_once 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitización y obtención de datos
    $cedula = trim($_POST['cedula'] ?? '');
    $correo = filter_var(trim($_POST['correo'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $direccion = trim($_POST['direccion'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';

    // Validaciones en servidor
    if (empty($cedula) || empty($correo) || empty($password) || empty($direccion) || empty($telefono) || empty($fecha_nacimiento)) {
        die("Por favor, completa todos los campos requeridos.");
    }

    if ($password !== $confirm_password) {
        die("Las contraseñas no coinciden.");
    }

    // Validación de la contraseña (8-16 caracteres, 1 mayúscula, 1 número)
    if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,16}$/', $password)) {
        die("La contraseña debe tener entre 8 y 16 caracteres, e incluir al menos una letra mayúscula y un número.");
    }

    try { 
        // Verificar si la cédula o el correo ya existen
        $checkStmt = $pdo->prepare("SELECT cedula FROM Persona WHERE cedula = :cedula OR correo = :correo");
        $checkStmt->execute([':cedula' => $cedula, ':correo' => $correo]);

        if ($checkStmt->fetch()) {
            echo "<script>
                    alert('La cédula o el correo electrónico ya se encuentran registrados.');
                    window.history.back();
                  </script>";
            exit();
        }

        // Hash seguro de la contraseña
        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        // Iniciar transacción SQL para insertar en Persona y Paciente
        $pdo->beginTransaction();

        // 1. Insertar en la tabla Persona
        $sqlPersona = "INSERT INTO Persona (cedula, correo, password_hash, direccion, telefono, fecha_nacimiento) 
                       VALUES (:cedula, :correo, :password_hash, :direccion, :telefono, :fecha_nacimiento)";
        
        $stmtPersona = $pdo->prepare($sqlPersona);
        $stmtPersona->execute([
            ':cedula' => $cedula,
            ':correo' => $correo,
            ':password_hash' => $password_hash,
            ':direccion' => $direccion,
            ':telefono' => $telefono,
            ':fecha_nacimiento' => $fecha_nacimiento
        ]);

        // 2. Insertar automáticamente en la tabla Paciente
        $sqlPaciente = "INSERT INTO Paciente (cedula) VALUES (:cedula)";
        $stmtPaciente = $pdo->prepare($sqlPaciente);
        $stmtPaciente->execute([':cedula' => $cedula]);

        // Confirmar transacción
        $pdo->commit();

        // Iniciar sesión del usuario
        $_SESSION['usuario_cedula'] = $cedula;
        $_SESSION['usuario_correo'] = $correo;

        // Alerta de éxito y redirección directa a index.html (subiendo un nivel desde /php/)
        echo "<script>
                alert('¡Registro exitoso!');
                window.location.href = '../index.html';
              </script>";
        exit();

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        die("Error al procesar el registro: " . $e->getMessage());
    }
} else {
    header("Location: ../index.html");
    exit();
}
?>