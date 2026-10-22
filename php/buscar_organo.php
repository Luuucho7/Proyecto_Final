<?php
require_once 'conexion.php';

$persona = trim($_POST['persona'] ?? '');

header('Content-Type: application/json');

if ($persona === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Escribí un nombre para buscar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM organo WHERE persona = :persona");
    $stmt->execute([':persona' => $persona]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($resultado) {
        echo json_encode(['exito' => true, 'datos' => $resultado]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el registro.']);
    }
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo realizar la búsqueda.']);
}