<?php 
require_once 'conexion.php';   // INGRESAR INSUMO.PHP

$cedula = $_POST['cedula'];
$estado = $_POST['estado']; 
$telefono = $_POST['telefono']; 
$nombre = $_POST['nombre']; 


$stmt = $pdo->prepare("INSERT INTO biologico (cedula, estado, telefono, nombre) VALUES (:cedula, :estado, :telefono, :nombre)");


header('Content-Type: application/json');

if($stmt->execute([':cedula' => $cedula, ':estado' => $estado, ':telefono' => $telefono, ':nombre' => $nombre])) {
    echo json_encode(['exito' => true]);
} else {
    echo json_encode(['exito' => false]);
}
