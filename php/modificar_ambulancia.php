<?php
// modificar_ambulancia.php
// Cambia el estado de una ambulancia. La matrícula no se puede cambiar:
// es su identificador y los traslados ya registrados la usan.
require_once 'conexion.php';

$matricula = trim($_POST['id'] ?? '');
$estado = trim($_POST['estado'] ?? 'libre');

header('Content-Type: application/json');

if ($matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
    exit();
}

if (!in_array($estado, ['libre', 'ocupada', 'en_servicio'], true)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El estado no es válido.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = :estado WHERE matricula = :matricula");
    $stmt->execute([
        ':matricula' => $matricula,
        ':estado' => $estado
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar la ambulancia.']);
}
