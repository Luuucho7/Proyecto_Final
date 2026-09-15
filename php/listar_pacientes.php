<?php
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id_paciente, nombre, cedula, telefono, estado FROM Paciente ORDER BY nombre");
    $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['exito' => true, 'pacientes' => $pacientes]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de pacientes.']);
}
