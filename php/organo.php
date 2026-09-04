<?php
require_once 'conexion.php';

$clasificacion = $_POST['persona'];
$pendiente = $_POST['en_curso'];

$stmt = $pdo->prepare("INSERT INTO organo (persona, en_curso) VALUES (:persona, :en_curso)");


header('Content-Type: application/json');

if($stmt->execute([':persona' => $persona, ':en_curso' => $en_curso])) {
    echo json_encode(['exito' => true]);
} else {
    echo json_encode(['exito' => false]);
}