<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$nombre = trim($_POST['nombre'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$estado = trim($_POST['estado'] ?? 'activo');

if ($nombre === '' || $cedula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el nombre y la cédula.']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO Paciente (nombre, cedula, telefono, estado)
        VALUES (:nombre, :cedula, :telefono, :estado)
    ");
    $stmt->execute([
        ':nombre' => $nombre,
        ':cedula' => $cedula,
        ':telefono' => $telefono,
        ':estado' => $estado
    ]);

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    // La cédula es UNIQUE en la base, así que el error más común acá es una cédula repetida
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar. Puede que ya exista un paciente con esa cédula.']);
}
