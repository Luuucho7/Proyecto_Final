<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Primero buscá el insumo que querés eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM biologico WHERE id = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el insumo.']);
}
