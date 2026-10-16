<?php
// Busca UN elemento biológico por nombre. Su resultado (con el "id") es lo que después
// permite Modificar o Eliminar, porque esos dos necesitan saber cuál fila tocar.
require_once 'conexion.php';

$nombre = $_POST['nombre'];

$stmt = $pdo -> prepare ("SELECT * FROM biologico WHERE nombre = :nombre");
$stmt -> execute([':nombre' => $nombre]);

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
 