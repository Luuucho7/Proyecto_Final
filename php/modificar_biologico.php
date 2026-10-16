<?php
// Actualiza un elemento biológico. Necesita el "id" que trajo buscar_Ingresar.php,
// por eso en la página primero hay que buscar y recién después se puede modificar.
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');
$nombre = trim($_POST['nombre'] ?? '');
$estado = trim($_POST['estado'] ?? '');

header('Content-Type: application/json');

if ($id === '' || $nombre === '' || $estado === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Primero buscá un insumo y completá los datos.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE biologico SET nombre = :nombre, estado = :estado WHERE id = :id");
    $stmt->execute([':id' => $id, ':nombre' => $nombre, ':estado' => $estado]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el insumo.']);
}
