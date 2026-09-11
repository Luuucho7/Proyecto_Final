<?php
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $consulta = $pdo->query("SELECT id_documento, nombre, tipo, fecha_creacion FROM Documentacion ORDER BY id_documento DESC");
    $documentos = $consulta->fetchAll();

    echo json_encode([
        'exito' => true,
        'documentos' => $documentos
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudieron traer los documentos.'
    ]);
}
