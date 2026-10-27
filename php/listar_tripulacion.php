<?php
// listar_tripulacion.php
// Devuelve todos los choferes y copilotos de la base en formato JSON.
// Lo usan tripulacion.html (la tabla) y Traslado.html (las listas de Chofer y Copiloto).
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id_tripulante, nombre, telefono, rol FROM Tripulante ORDER BY nombre");
    $tripulantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'tripulantes' => $tripulantes]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de choferes y copilotos.']);
}
