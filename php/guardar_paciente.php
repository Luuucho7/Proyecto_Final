<?php
require_once 'conexion.php';

$nombre = trim($_POST['nombre'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$estado = trim($_POST['estado'] ?? 'activo');

header('Content-Type: application/json');

if ($nombre === '' || $cedula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el nombre y la cédula.']);
    exit();
}

try {
    $verificar = $pdo->prepare("SELECT id_paciente FROM Paciente WHERE cedula = :cedula");
    $verificar->execute([':cedula' => $cedula]);

    if ($verificar->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe un paciente con esa cédula.']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO Paciente (nombre, cedula, telefono, estado) VALUES (:nombre, :cedula, :telefono, :estado)");
    $stmt->execute([
        ':nombre' => $nombre,
        ':cedula' => $cedula,
        ':telefono' => $telefono,
        ':estado' => $estado
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el paciente.']);
}
