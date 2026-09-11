<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

if (!$id) {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el ID del paciente a eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el paciente.']);
}
