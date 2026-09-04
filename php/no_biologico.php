<?php
require_once 'conexion.php';

$clasificacion = $_POST['clasificacion'];
$pendiente = $_POST['pendiente'];

$stmt = $pdo->prepare("INSERT INTO no_biologico (clasificacion, pendiente) VALUES (:clasificacion, :pendiente)");


header('Content-Type: application/json');

if($stmt->execute([':clasificacion' => $clasificacion, ':pendiente' => $pendiente])) {
    echo json_encode(['exito' => true]);
} else {
    echo json_encode(['exito' => false]);
}