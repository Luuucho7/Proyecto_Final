<?php
require_once 'conexion.php';

$nombre = $_POST['nombre'];
$estado = $_POST['estado'];

$stmt = $pdo->prepare("INSERT INTO biologico (nombre, estado) VALUES (:nombre, :estado)");


header('Content-Type: application/json');

if($stmt->execute([':nombre' => $nombre, ':estado' => $estado])) {
    echo json_encode(['exito' => true]);
} else {
    echo json_encode(['exito' => false]);
}