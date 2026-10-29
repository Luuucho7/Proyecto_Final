<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta la persona a eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM Tripulante WHERE id_tripulante = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el chofer o copiloto.']);
}
