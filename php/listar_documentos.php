<?php
// listar_documentos.php
// Devuelve TODOS los documentos de la base en formato JSON.
// Lo usa Documentacion.js para dibujar la tabla "Documentos Cargados".
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    // Ordenados por id: el documento 1 aparece primero (el mismo id que usa el QR)
    $stmt = $pdo->query("SELECT id_documento, nombre, tipo, archivo, fecha_creacion FROM Documentacion ORDER BY id_documento");
    $documentos = $stmt->fetchAll();

    echo json_encode(['exito' => true, 'documentos' => $documentos]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de documentos.']);
}
