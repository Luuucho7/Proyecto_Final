<?php
// Actualiza un paciente que ya existe (lo llama pacientes.js cuando id_paciente SÍ tiene valor)
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');
$nombre = trim($_POST['nombre'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$estado = trim($_POST['estado'] ?? 'activo');

header('Content-Type: application/json');

if ($id === '' || $nombre === '' || $cedula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
    exit();
}

try {
    // UPDATE ... WHERE id_paciente = :id -> solo toca la fila de ESE paciente
    $stmt = $pdo->prepare("UPDATE Paciente SET nombre = :nombre, cedula = :cedula, telefono = :telefono, estado = :estado WHERE id_paciente = :id");
    $stmt->execute([
        ':id' => $id,
        ':nombre' => $nombre,
        ':cedula' => $cedula,
        ':telefono' => $telefono,
        ':estado' => $estado
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el paciente.']);
}
