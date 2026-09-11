<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$persona = trim($_POST['persona'] ?? '');
$en_curso = trim($_POST['en_curso'] ?? '');

if ($persona === '' || $en_curso === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá los dos campos.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO organo (persona, en_curso) VALUES (:persona, :en_curso)");
    $stmt->execute([':persona' => $persona, ':en_curso' => $en_curso]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el registro.']);
}