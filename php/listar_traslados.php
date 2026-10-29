<?php
require_once 'conexion.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT t.id_traslado, t.tipo_elemento, t.matricula, t.chofer, t.copiloto, t.id_paciente,
                   t.hora_salida, t.hora_llegada, t.hora_llegada_real, t.hora_retorno,
                   t.origen, t.destino, t.estado,
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
