<?php
require_once 'conexion.php';

$clasificacion = $_POST['clasificacion'];
$pendiente = $_POST['pendiente'];

$stmt = $pdo -> prepare ("SELECT * FROM no_biologico WHERE clasificacion = :clasificacion AND pendiente = :pendiente");
$stmt -> execute([':clasificacion' => $clasificacion, ':pendiente' => $pendiente]);

$resultado = $stmt->fetch(PDO::FETCH_ASSOC);

header('Content-Type: application/json');

if($resultado) {
    echo json_encode(['exito' => true, 'datos' => $resultado]);
    exit();
}  else{
    echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el insumo.']);
    exit();
};
?>
 