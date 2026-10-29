<?php
// buscar_noBiologico.php
// Busca en la tabla no_biologico los registros cuyo "clasificacion" CONTIENE lo escrito (no hace falta escribirlo entero).
// Devuelve TODOS los que coinciden, cada uno con el número de su traslado,
// porque cada traslado guarda su propio elemento y puede haber varios con el mismo nombre.
require_once 'conexion.php';

$clasificacion = trim($_POST['clasificacion'] ?? '');

header('Content-Type: application/json');

if ($clasificacion === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Escribí la clasificación para buscar.']);
    exit();
}

try {
    // LIKE con % adelante y atrás = "que contenga lo escrito"
    // LEFT JOIN con Traslado = traer también el número del traslado al que pertenece
    $stmt = $pdo->prepare(
        "SELECT e.id, e.clasificacion, e.pendiente, t.id_traslado
         FROM no_biologico e
         LEFT JOIN Traslado t ON t.tipo_elemento = 'no_biologico' AND t.id_elemento = e.id
         WHERE e.clasificacion LIKE :buscado
         ORDER BY e.id DESC"
    );
    $stmt->execute([':buscado' => '%' . $clasificacion . '%']);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($resultados) > 0) {
        echo json_encode(['exito' => true, 'datos' => $resultados]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el insumo.']);
    }
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo realizar la búsqueda.']);
}
