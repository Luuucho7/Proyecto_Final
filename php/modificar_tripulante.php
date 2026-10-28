<?php
// modificar_tripulante.php
// Cambia los datos de un chofer o copiloto que ya existe
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede usar este archivo
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
    // La persona tiene que existir (por si la eliminaron mientras se estaba editando)
    $existe = $pdo->prepare("SELECT id_tripulante FROM Tripulante WHERE id_tripulante = :id");
    $existe->execute([':id' => $id]);

    if (!$existe->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Esa persona ya no existe. Recargá la página.']);
        exit();
    }

    // Que no quede repetido con OTRA persona (la misma persona sí puede quedar igual)
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
