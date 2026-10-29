<?php
// listar_documentos.php
// Devuelve los documentos de la tabla Documentacion en formato JSON.
// Lo usa Documentacion.html para dibujar la tabla "Documentos Cargados".
// Así la tabla siempre coincide con lo que abre el QR (php/ver_documento.php?id=...)
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id_documento, nombre, tipo, fecha_creacion FROM Documentacion ORDER BY id_documento");
    $documentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'documentos' => $documentos]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de documentos.']);
}
