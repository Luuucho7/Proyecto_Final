<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');
$nombre = trim($_POST['nombre'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$rol = trim($_POST['rol'] ?? '');

header('Content-Type: application/json');

if ($id === '' || $nombre === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
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
    $existe = $pdo->prepare("SELECT id_tripulante FROM Tripulante WHERE id_tripulante = :id");
    $existe->execute([':id' => $id]);

    if (!$existe->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Esa persona ya no existe. Recargá la página.']);
        exit();
    }

    $verificar = $pdo->prepare("SELECT id_tripulante FROM Tripulante WHERE nombre = :nombre AND rol = :rol AND id_tripulante <> :id");
    $verificar->execute([':nombre' => $nombre, ':rol' => $rol, ':id' => $id]);

    if ($verificar->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe una persona con ese nombre y ese rol.']);
        exit();
    }

    $stmt = $pdo->prepare("UPDATE Tripulante SET nombre = :nombre, telefono = :telefono, rol = :rol WHERE id_tripulante = :id");
    $stmt->execute([
        ':id' => $id,
        ':nombre' => $nombre,
        ':telefono' => $telefono,
        ':rol' => $rol
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el chofer o copiloto.']);
}
