<?php
require_once 'conexion.php';

header('Content-Type: application/json');

// Datos que manda ingresarInsumo.js
$nombre = trim($_POST['nombre'] ?? '');
$estado = trim($_POST['estado'] ?? '');

// Si falta algún dato, avisamos y cortamos (no guardamos filas vacías)
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