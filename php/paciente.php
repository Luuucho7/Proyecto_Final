<?php

require_once 'conexion.php';

header('Content-Type: application/json');

$nombre = $_POST['nombre'];
$cedula = $_POST['cedula'];
$telefono = $_POST['telefono'];
$estado = $_POST['estado'];

try {

    $stmt = $pdo->prepare("
        INSERT INTO Paciente
        (nombre, cedula, telefono, estado)
        VALUES
        (:nombre, :cedula, :telefono, :estado)
    ");

    $stmt->execute([
        ':nombre' => $nombre,
        ':cedula' => $cedula,
        ':telefono' => $telefono,
        ':estado' => $estado
    ]);

    echo json_encode([
        'exito' => true
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'exito' => false,
        'error' => $e->getMessage()
    ]);
}
?>