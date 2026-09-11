<?php
require_once 'conexion.php';

header('Content-Type: application/json');

// El ID nos dice CUÁL documento hay que modificar
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');

if (!$id || $nombre === '' || $tipo === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para editar el documento.']);
    exit();
}

try {
    $stmt = $pdo->prepare("UPDATE Documentacion SET nombre = :nombre, tipo = :tipo WHERE id_documento = :id");
    $stmt->execute([
        ':nombre' => $nombre,
        ':tipo' => $tipo,
        ':id' => $id
    ]);

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo editar el documento.']);
}
