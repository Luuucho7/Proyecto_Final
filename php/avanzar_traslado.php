<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$id = trim($_POST['id_traslado'] ?? '');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el traslado a actualizar.']);
    exit();
}

$siguiente = [
    'en_camino'  => 'en_destino',
    'en_destino' => 'retornando',
    'retornando' => 'finalizado'
];

try {
    $pdo->beginTransaction();

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

    if ($nuevoEstado === 'en_destino') {
        $sql = "UPDATE Traslado SET estado = :estado, hora_llegada_real = NOW() WHERE id_traslado = :id";
    } else if ($nuevoEstado === 'finalizado') {
        $sql = "UPDATE Traslado SET estado = :estado, hora_retorno = NOW() WHERE id_traslado = :id";
    } else {
        $sql = "UPDATE Traslado SET estado = :estado WHERE id_traslado = :id";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':estado' => $nuevoEstado, ':id' => $id]);

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
