<?php
// Trae TODOS los documentos de la base, para dibujar la tabla en Documentacion.html
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id_documento, nombre, tipo, fecha_creacion, archivo FROM Documentacion ORDER BY id_documento DESC");
    $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'documentos' => $documentos]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de documentos.']);
}
