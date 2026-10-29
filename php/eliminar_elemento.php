<?php
// eliminar_elemento.php
// La usan eliminar_biologico.php, eliminar_noBiologico.php y eliminar_organo.php.
// Los tres hacían lo mismo, cambiando solo la tabla y los mensajes, así que el código está acá una sola vez.
//
// Borra un elemento JUNTO CON su traslado.
// Cada traslado tiene un solo elemento: si se borrara solo el elemento, el traslado quedaría "huérfano"
// (en la lista aparecería sin elemento). Si el traslado estaba en curso, su ambulancia vuelve a quedar libre.
//   $tabla:        'biologico', 'no_biologico' u 'organo' (es también el tipo_elemento del traslado)
//   $mensajeFalta: lo que se responde si no llegó el id
//   $mensajeError: lo que se responde si falla la base de datos
function eliminarElemento($pdo, $tabla, $mensajeFalta, $mensajeError) {

    $id = trim($_POST['id'] ?? '');

    header('Content-Type: application/json');

    if ($id === '') {
        echo json_encode(['exito' => false, 'mensaje' => $mensajeFalta]);
        exit();
    }

    try {
        // Todo va junto: si falla una parte, no se borra nada
        $pdo->beginTransaction();

        // 1. Buscar el traslado al que pertenece este elemento
        $stmt = $pdo->prepare("SELECT id_traslado, matricula, estado FROM Traslado WHERE tipo_elemento = :tipo AND id_elemento = :id");
        $stmt->execute([':tipo' => $tabla, ':id' => $id]);
        $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($traslado) {
            // 2. Borrar el traslado
            $stmt = $pdo->prepare("DELETE FROM Traslado WHERE id_traslado = :id_traslado");
            $stmt->execute([':id_traslado' => $traslado['id_traslado']]);

            // 3. Si todavía no había vuelto al hospital, liberar la ambulancia
            if ($traslado['estado'] !== 'finalizado') {
                $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
                $stmt->execute([':matricula' => $traslado['matricula']]);
            }
        }

        // 4. Borrar el elemento ($tabla no viene del usuario: la escribe cada archivo eliminar_*.php)
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
