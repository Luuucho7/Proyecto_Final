<?php
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id_documento, nombre, tipo, fecha_creacion FROM Documentacion ORDER BY id_documento");
    $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'documentos' => $documentos]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de documentos.']);
}
