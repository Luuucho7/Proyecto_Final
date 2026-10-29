<?php
require_once 'conexion.php';

// js/idioma.js guarda el idioma elegido en una cookie: así PHP también sabe si hay que responder en inglés
$ingles = (($_COOKIE['idioma'] ?? 'es') === 'en');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $nombre = trim($_POST['nombre'] ?? '');
    $apellido = trim($_POST['apellido'] ?? '');
    $cedula = trim($_POST['cedula'] ?? '');
    $correo = filter_var(trim($_POST['correo'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    $direccion = trim($_POST['direccion'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';

    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($correo) || empty($password) || empty($direccion) || empty($telefono) || empty($fecha_nacimiento)) {
        die("Por favor, completa todos los campos requeridos.");
    }

    if ($password !== $confirm_password) {
        die("Las contraseñas no coinciden.");
    }

    if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,16}$/', $password)) {
        die("La contraseña debe tener entre 8 y 16 caracteres, e incluir al menos una mayúscula y un número.");
    }

    try {
        $checkStmt = $pdo->prepare("SELECT cedula FROM Persona WHERE cedula = :cedula OR correo = :correo");
        $checkStmt->execute([':cedula' => $cedula, ':correo' => $correo]);

        if ($checkStmt->fetch()) {
            echo "<script>
                    alert('" . ($ingles ? 'The ID number or email is already registered.' : 'La cédula o el correo electrónico ya se encuentran registrados.') . "');
                    window.history.back();
                  </script>";
            exit();
        }

        $password_hash = password_hash($password, PASSWORD_BCRYPT);

        $pdo->beginTransaction();

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

        // Puede que la persona ya esté cargada como paciente (la cargó un funcionario antes de que se registrara).
        // En ese caso no se crea otro paciente: se usa el que ya existe.
        $buscarPaciente = $pdo->prepare("SELECT id_paciente FROM Paciente WHERE cedula = :cedula");
        $buscarPaciente->execute([':cedula' => $cedula]);
        $pacienteExistente = $buscarPaciente->fetch();

        if (!$pacienteExistente) {
            $sqlPaciente = "INSERT INTO Paciente (cedula, nombre) VALUES (:cedula, :nombre)";
            $stmtPaciente = $pdo->prepare($sqlPaciente);
            $stmtPaciente->execute([
                ':cedula' => $cedula,
                ':nombre' => $nombre . ' ' . $apellido
            ]);
        }

        $pdo->commit();

        echo "<script>
                alert('" . ($ingles ? 'Registration successful!' : '¡Registro exitoso!') . "');
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