<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$nombre = trim($_POST['nombre'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$estado = trim($_POST['estado'] ?? 'activo');

if (!$id || $nombre === '' || $cedula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para editar el paciente.']);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE Paciente
        SET nombre = :nombre, cedula = :cedula, telefono = :telefono, estado = :estado
        WHERE id_paciente = :id
    ");
    $stmt->execute([
        ':nombre' => $nombre,
        ':cedula' => $cedula,
        ':telefono' => $telefono,
        ':estado' => $estado,
        ':id' => $id
    ]);

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo editar el paciente.']);
}
