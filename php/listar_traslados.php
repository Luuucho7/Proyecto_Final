<?php
// listar_traslados.php
// Devuelve TODOS los traslados con su información, en formato JSON.
// Lo usa traslados_lista.html para dibujar la tabla.
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede ver los traslados
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    // El elemento trasladado está en una de tres tablas (biologico, no_biologico u organo),
    // según el tipo del traslado. Por eso se unen las tres con LEFT JOIN: solo una va a coincidir.
    $sql = "SELECT t.id_traslado, t.tipo_elemento, t.matricula, t.chofer, t.copiloto, t.id_paciente,
                   t.hora_salida, t.hora_llegada, t.origen, t.destino, t.estado,
                   p.nombre AS paciente,
                   COALESCE(b.nombre, n.clasificacion, o.persona) AS elemento,
                   COALESCE(b.estado, n.pendiente, o.en_curso) AS detalle
            FROM Traslado t
            LEFT JOIN biologico b ON t.tipo_elemento = 'biologico' AND b.id = t.id_elemento
            LEFT JOIN no_biologico n ON t.tipo_elemento = 'no_biologico' AND n.id = t.id_elemento
            LEFT JOIN organo o ON t.tipo_elemento = 'organo' AND o.id = t.id_elemento
            LEFT JOIN Paciente p ON p.id_paciente = t.id_paciente
            ORDER BY t.id_traslado DESC";

    $stmt = $pdo->query($sql);
    $traslados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['exito' => true, 'traslados' => $traslados]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo obtener la lista de traslados.']);
}
