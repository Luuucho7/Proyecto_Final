<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$clasificacion = trim($_POST['clasificacion'] ?? '');
$pendiente = trim($_POST['pendiente'] ?? '');

if ($clasificacion === '' || $pendiente === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá la clasificación y el estado.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO no_biologico (clasificacion, pendiente) VALUES (:clasificacion, :pendiente)");
    $stmt->execute([':clasificacion' => $clasificacion, ':pendiente' => $pendiente]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el insumo.']);
}