<?php
// listar_personas.php
// Devuelve el nombre completo de todas las personas registradas.
// Lo usa traslado.js para sugerir nombres mientras se escribe el chofer o el copiloto.
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    // CONCAT junta nombre y apellido en una sola columna: "Facundo Ceriotti"
    $stmt = $pdo->query("SELECT CONCAT(nombre, ' ', apellido) FROM Persona ORDER BY nombre, apellido");

    // FETCH_COLUMN devuelve una lista simple de textos (sin armar un array por cada fila)
    $personas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['exito' => true, 'personas' => $personas]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'personas' => []]);
}
