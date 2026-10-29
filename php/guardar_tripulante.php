<?php
require_once 'conexion.php';

$nombre = trim($_POST['nombre'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$rol = trim($_POST['rol'] ?? '');

header('Content-Type: application/json');

if ($nombre === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el nombre.']);
    exit();
}

if (mb_strlen($nombre) > 100) {
    echo json_encode(['exito' => false, 'mensaje' => 'El nombre es demasiado largo (máximo 100 letras).']);
    exit();
}

if (!in_array($rol, ['chofer', 'copiloto'], true)) {
    echo json_encode(['exito' => false, 'mensaje' => 'Elegí si es chofer o copiloto.']);
    exit();
}

try {
    $verificar = $pdo->prepare("SELECT id_tripulante FROM Tripulante WHERE nombre = :nombre AND rol = :rol");
    $verificar->execute([':nombre' => $nombre, ':rol' => $rol]);

    if ($verificar->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe una persona con ese nombre y ese rol.']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO Tripulante (nombre, telefono, rol) VALUES (:nombre, :telefono, :rol)");
    $stmt->execute([
        ':nombre' => $nombre,
        ':telefono' => $telefono,
        ':rol' => $rol
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el chofer o copiloto.']);
}
