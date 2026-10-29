<?php
// listar_ambulancias.php
// Devuelve todas las ambulancias de la base en formato JSON (para dibujar la tabla de ambulancias.html)
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT matricula, estado FROM Ambulancia ORDER BY matricula");
    $ambulancias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'ambulancias' => $ambulancias]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de ambulancias.']);
}
