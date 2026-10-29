<?php
require_once 'conexion.php';

$matricula = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta la ambulancia a eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM Ambulancia WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: la ambulancia tiene traslados registrados.']);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar la ambulancia.']);
    }
}
