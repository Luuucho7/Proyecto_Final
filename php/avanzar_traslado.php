<?php
// avanzar_traslado.php
// Pasa un traslado al siguiente paso de su recorrido:
//   En camino -> En destino -> Retornando -> Finalizado
// - Al pasar a "En destino" se guarda la hora real de llegada.
// - Al pasar a "Finalizado" se guarda la hora de retorno y la ambulancia vuelve a quedar libre.
// Lo usa el botón de cada fila de traslados_lista.html
require_once 'conexion.php';

header('Content-Type: application/json');

$id = trim($_POST['id_traslado'] ?? '');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el traslado a actualizar.']);
    exit();
}

// Qué paso sigue después de cada estado
$siguiente = [
    'en_camino'  => 'en_destino',
    'en_destino' => 'retornando',
    'retornando' => 'finalizado'
];

try {
    // Todo va junto: si falla una parte, no se hace ninguna
    $pdo->beginTransaction();

    // 1. Buscar el traslado
    $stmt = $pdo->prepare("SELECT matricula, estado FROM Traslado WHERE id_traslado = :id");
    $stmt->execute([':id' => $id]);
    $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$traslado) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado no existe.']);
        exit();
    }

    if (!isset($siguiente[$traslado['estado']])) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado ya estaba finalizado.']);
        exit();
    }

    $nuevoEstado = $siguiente[$traslado['estado']];

    // 2. Guardar el estado nuevo (y la hora, si corresponde)
    if ($nuevoEstado === 'en_destino') {
        $sql = "UPDATE Traslado SET estado = :estado, hora_llegada_real = NOW() WHERE id_traslado = :id";
    } else if ($nuevoEstado === 'finalizado') {
        $sql = "UPDATE Traslado SET estado = :estado, hora_retorno = NOW() WHERE id_traslado = :id";
    } else {
        $sql = "UPDATE Traslado SET estado = :estado WHERE id_traslado = :id";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':estado' => $nuevoEstado, ':id' => $id]);

    // 3. Si volvió al hospital, liberar la ambulancia (solo si estaba "En servicio"; si la pusieron "Ocupada" a mano, se respeta)
    if ($nuevoEstado === 'finalizado') {
        $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
        $stmt->execute([':matricula' => $traslado['matricula']]);
    }

    $pdo->commit();

    echo json_encode(['exito' => true, 'estado' => $nuevoEstado]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo actualizar el traslado.']);
}
