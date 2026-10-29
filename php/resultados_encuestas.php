<?php
// resultados_encuestas.php
// Calcula los indicadores de satisfacción con las respuestas guardadas en la tabla Encuesta.
// Lo usa encuestas_resultados.html. Se puede filtrar por servicio: resultados_encuestas.php?servicio=Laboratorio
require_once 'conexion.php';

header('Content-Type: application/json');

$servicio = trim($_GET['servicio'] ?? '');

// La atención se responde con palabras: se pasan a un puntaje del 1 al 5 para poder sacar el promedio
$puntajeAtencion = "CASE atencion
                        WHEN 'Excelente' THEN 5
                        WHEN 'Muy Buena' THEN 4
                        WHEN 'Buena' THEN 3
                        WHEN 'Regular' THEN 2
                        WHEN 'Mala' THEN 1
                    END";

// Si se eligió un servicio, todas las consultas se limitan a ese servicio
$condicion = '';
$parametros = [];

if ($servicio !== '') {
    $condicion = 'WHERE servicio = :servicio';
    $parametros = [':servicio' => $servicio];
}

try {
    // ---------- 1. Indicadores generales ----------
    // AVG de una comparación (por ejemplo amabilidad = 'Si') da la proporción de respuestas "Sí" (entre 0 y 1)
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

    // ---------- 2. Cuántas respuestas tuvo cada calificación de la atención ----------
    $stmt = $pdo->prepare("SELECT atencion, COUNT(*) AS cantidad FROM Encuesta $condicion GROUP BY atencion");
    $stmt->execute($parametros);
    $atencion = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);   // queda así: ['Excelente' => 4, 'Buena' => 2, ...]

    // ---------- 3. Indicadores de cada servicio (siempre de todos, para poder compararlos) ----------
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

    // ---------- 4. Últimos comentarios escritos ----------
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
