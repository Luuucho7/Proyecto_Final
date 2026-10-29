<?php
require_once 'conexion.php';

$nombre = trim($_POST['nombre'] ?? '');

header('Content-Type: application/json');

if ($nombre === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Escribí el nombre del insumo para buscar.']);
    exit();
}

try {
    $stmt = $pdo->prepare(
        "SELECT e.id, e.nombre, e.estado, t.id_traslado
         FROM biologico e
         LEFT JOIN Traslado t ON t.tipo_elemento = 'biologico' AND t.id_elemento = e.id
         WHERE e.nombre LIKE :buscado
         ORDER BY e.id DESC"
    );
    $stmt->execute([':buscado' => '%' . $nombre . '%']);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($resultados) > 0) {
        echo json_encode(['exito' => true, 'datos' => $resultados]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el insumo.']);
    }
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo realizar la búsqueda.']);
}
