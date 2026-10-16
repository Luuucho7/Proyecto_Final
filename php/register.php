<?php
session_start();
require_once 'conexion.php';

// register.js ya dejó pasar el formulario porque validó todo en el navegador,
// pero acá se repiten las validaciones importantes: el JavaScript se puede desactivar,
// así que el servidor nunca debe confiar ciegamente en lo que mandó el navegador.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Recibimos y limpiamos cada campo del formulario
    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $cedula = trim($_POST['cedula'] ?? '');
    $correo = filter_var(trim($_POST['correo'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $direccion = trim($_POST['direccion'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';

    // Nada puede quedar vacío
    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($correo) || empty($password) || empty($direccion) || empty($telefono) || empty($fecha_nacimiento)) {
        die("Por favor, completa todos los campos requeridos.");
    }

    if ($password !== $confirm_password) {
        die("Las contraseñas no coinciden.");
    }

    // La contraseña tiene que tener 1 mayúscula, 1 número, y entre 8 y 16 caracteres
    if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,16}$/', $password)) {
        die("La contraseña debe tener entre 8 y 16 caracteres, e incluir al menos una mayúscula y un número.");
    }

    try {
        // Antes de crear la cuenta, chequeamos que esa cédula o correo no estén ya registrados
        $checkStmt = $pdo->prepare("SELECT cedula FROM Persona WHERE cedula = :cedula OR correo = :correo");
        $checkStmt->execute([':cedula' => $cedula, ':correo' => $correo]);

        if ($checkStmt->fetch()) {
            echo "<script>
                    alert('La cédula o el correo electrónico ya se encuentran registrados.');
                    window.history.back();
                  </script>";
            exit();
        }

        // La contraseña nunca se guarda tal cual: se convierte en un hash de un solo sentido
        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        // Transacción: las dos inserciones de abajo (Persona y Paciente) se aplican juntas.
        // Si una falla, rollBack() deshace la otra, así nunca queda una a medias.
        $pdo->beginTransaction();

        // Creación de la cuenta en Persona
        $sqlPersona = "INSERT INTO Persona (cedula, nombre, apellido, correo, password_hash, direccion, telefono, fecha_nacimiento)
                       VALUES (:cedula, :nombre, :apellido, :correo, :password_hash, :direccion, :telefono, :fecha_nacimiento)";

        $stmtPersona = $pdo->prepare($sqlPersona);
        $stmtPersona->execute([
            ':cedula' => $cedula,
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':correo' => $correo,
            ':password_hash' => $password_hash,
            ':direccion' => $direccion,
            ':telefono' => $telefono,
            ':fecha_nacimiento' => $fecha_nacimiento
        ]);

        // Todo el que se registra queda también dado de alta como Paciente
        $sqlPaciente = "INSERT INTO Paciente (cedula, nombre) VALUES (:cedula, :nombre)";
        $stmtPaciente = $pdo->prepare($sqlPaciente);
        $stmtPaciente->execute([
            ':cedula' => $cedula,
            ':nombre' => $nombre . ' ' . $apellido
        ]);

        // Las dos inserciones salieron bien: se confirman juntas
        $pdo->commit();

        // Registro exitoso: lo dejamos logueado directamente, sin pedirle que inicie sesión de nuevo
        $_SESSION['usuario_cedula'] = $cedula;
        $_SESSION['usuario_correo'] = $correo;

        echo "<script>
                alert('¡Registro exitoso!');
                window.location.href = '../index.html';
              </script>";
        exit();

    } catch (Exception $e) {
        // Si algo falló durante la transacción, deshacemos lo que se haya alcanzado a insertar
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        die("Error al procesar el registro: " . $e->getMessage());
    }

} else {
    // Si alguien entra a este archivo directamente (sin enviar el formulario), lo mandamos al inicio
    header("Location: ../index.html");
    exit();
}
?>