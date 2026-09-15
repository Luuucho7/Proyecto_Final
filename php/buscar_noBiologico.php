<?php
require_once 'conexion.php';

$clasificacion = $_POST['clasificacion'];

$stmt = $pdo -> prepare ("SELECT * FROM no_biologico WHERE clasificacion = :clasificacion");
$stmt -> execute ([":clasificacion" => $clasificacion]);

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
 