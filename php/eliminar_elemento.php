<?php
function eliminarElemento($pdo, $tabla, $mensajeFalta, $mensajeError) {

    $id = trim($_POST['id'] ?? '');

    header('Content-Type: application/json');

    if ($id === '') {
        echo json_encode(['exito' => false, 'mensaje' => $mensajeFalta]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("SELECT id_traslado, matricula, estado FROM Traslado WHERE tipo_elemento = :tipo AND id_elemento = :id");
        $stmt->execute([':tipo' => $tabla, ':id' => $id]);
        $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($traslado) {
            $stmt = $pdo->prepare("DELETE FROM Traslado WHERE id_traslado = :id_traslado");
            $stmt->execute([':id_traslado' => $traslado['id_traslado']]);

            if ($traslado['estado'] !== 'finalizado') {
                $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
                $stmt->execute([':matricula' => $traslado['matricula']]);
            }
        }

        $stmt = $pdo->prepare("DELETE FROM $tabla WHERE id = :id");
        $stmt->execute([':id' => $id]);

        $pdo->commit();

        echo json_encode(['exito' => true]);

    } catch (PDOException $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        echo json_encode(['exito' => false, 'mensaje' => $mensajeError]);
    }
}
