<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');
$clasificacion = trim($_POST['clasificacion'] ?? '');
$pendiente = trim($_POST['pendiente'] ?? '');

header('Content-Type: application/json');

if ($id === '' || $clasificacion === '' || $pendiente === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Primero buscá un insumo y completá los datos.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE no_biologico SET clasificacion = :clasificacion, pendiente = :pendiente WHERE id = :id");
    $stmt->execute([':id' => $id, ':clasificacion' => $clasificacion, ':pendiente' => $pendiente]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el objeto.']);
}
