<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$servicio = trim($_GET['servicio'] ?? '');

$puntajeAtencion = "CASE atencion
                        WHEN 'Excelente' THEN 5
                        WHEN 'Muy Buena' THEN 4
                        WHEN 'Buena' THEN 3
                        WHEN 'Regular' THEN 2
                        WHEN 'Mala' THEN 1
                    END";

$condicion = '';
$parametros = [];

if ($servicio !== '') {
    $condicion = 'WHERE servicio = :servicio';
    $parametros = [':servicio' => $servicio];
}

try {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS total,
                AVG(edad) AS edad_promedio,
                AVG($puntajeAtencion) AS atencion_promedio,
                AVG(atencion IN ('Excelente', 'Muy Buena', 'Buena')) * 100 AS satisfechos,
                AVG(amabilidad = 'Si') * 100 AS amabilidad,
                AVG(informacion = 'Si') * 100 AS informacion,
                AVG(instalaciones) AS instalaciones_promedio,
                AVG(recomendacion = 'Si') * 100 AS recomendacion
         FROM Encuesta $condicion"
    );
    $stmt->execute($parametros);
    $generales = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("SELECT atencion, COUNT(*) AS cantidad FROM Encuesta $condicion GROUP BY atencion");
    $stmt->execute($parametros);
    $atencion = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $stmt = $pdo->query(
        "SELECT servicio,
                COUNT(*) AS total,
                AVG($puntajeAtencion) AS atencion_promedio,
                AVG(instalaciones) AS instalaciones_promedio,
                AVG(recomendacion = 'Si') * 100 AS recomendacion
         FROM Encuesta
         GROUP BY servicio
         ORDER BY total DESC"
    );
    $servicios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $condicionComentarios = "WHERE comentarios <> ''";

    if ($servicio !== '') {
        $condicionComentarios .= ' AND servicio = :servicio';
    }

    $stmt = $pdo->prepare(
        "SELECT nombre, servicio, atencion, comentarios, fecha
         FROM Encuesta $condicionComentarios
         ORDER BY fecha DESC
         LIMIT 20"
    );
    $stmt->execute($parametros);
    $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'exito' => true,
        'generales' => $generales,
        'atencion' => $atencion,
        'servicios' => $servicios,
        'comentarios' => $comentarios
    ]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudieron calcular los resultados de las encuestas.']);
}
