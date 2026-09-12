<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$nombre = trim($_POST['nombre'] ?? '');
$estado = trim($_POST['estado'] ?? '');

if ($nombre === '' || $estado === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el nombre y el estado.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO biologico (nombre, estado) VALUES (:nombre, :estado)");
    $stmt->execute([':nombre' => $nombre, ':estado' => $estado]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el insumo.']);
}
?>