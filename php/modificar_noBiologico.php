<?php
require_once 'conexion.php';

// Datos que manda ingresarInsumo.js
$clasificacion = trim($_POST['clasificacion'] ?? '');
$pendiente = trim($_POST['pendiente'] ?? '');

header('Content-Type: application/json');

// Si falta algún dato, avisamos y cortamos (no guardamos filas vacías)
if ($clasificacion === '' || $pendiente === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá la clasificación y el estado.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE no_biologico SET pendiente = :pendiente WHERE clasificacion = :clasificacion");
    $stmt->execute([':clasificacion' => $clasificacion, ':pendiente' => $pendiente]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el objeto.']);
}
?>

