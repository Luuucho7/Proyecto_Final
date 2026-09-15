<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el paciente a eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el paciente.']);
}
