<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');
$persona = trim($_POST['persona'] ?? '');
$en_curso = trim($_POST['en_curso'] ?? '');

header('Content-Type: application/json');

if ($id === '' || $persona === '' || $en_curso === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Primero buscá un registro y completá los datos.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE organo SET persona = :persona, en_curso = :en_curso WHERE id = :id");
    $stmt->execute([':id' => $id, ':persona' => $persona, ':en_curso' => $en_curso]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el registro.']);
}
