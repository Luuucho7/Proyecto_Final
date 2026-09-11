<?php
require_once 'conexion.php';

header('Content-Type: application/json');

// Datos que manda el formulario de "Subir Documento"
$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');

// Si falta algún dato, avisamos y cortamos (no guardamos filas vacías)
if ($nombre === '' || $tipo === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el tipo y la descripción del documento.']);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO Documentacion (nombre, tipo, fecha_creacion) VALUES (:nombre, :tipo, CURDATE())");
    $stmt->execute([
        ':nombre' => $nombre,
        ':tipo' => $tipo
    ]);

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el documento.']);
}
