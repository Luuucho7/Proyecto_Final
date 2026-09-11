<?php
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $consulta = $pdo->query("SELECT id_paciente, nombre, cedula, telefono, estado FROM Paciente ORDER BY id_paciente DESC");
    $pacientes = $consulta->fetchAll();

    echo json_encode([
        'exito' => true,
        'pacientes' => $pacientes
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudieron traer los pacientes.'
    ]);
}
