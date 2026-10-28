<?php
// eliminar_noBiologico.php
// Borra un elemento de la tabla no_biologico JUNTO CON su traslado.
// Cada traslado tiene un solo elemento: si se borrara solo el elemento, el traslado quedaría "huérfano"
// (en la lista aparecería sin elemento). Si el traslado estaba en curso, su ambulancia vuelve a quedar libre.
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede usar este archivo
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Primero buscá el insumo que querés eliminar.']);
    exit();
}

try {
    // Todo va junto: si falla una parte, no se borra nada
    $pdo->beginTransaction();

    // 1. Buscar el traslado al que pertenece este elemento
    $stmt = $pdo->prepare("SELECT id_traslado, matricula, estado FROM Traslado WHERE tipo_elemento = 'no_biologico' AND id_elemento = :id");
    $stmt->execute([':id' => $id]);
    $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($traslado) {
        // 2. Borrar el traslado
        $stmt = $pdo->prepare("DELETE FROM Traslado WHERE id_traslado = :id_traslado");
        $stmt->execute([':id_traslado' => $traslado['id_traslado']]);

        // 3. Si estaba en curso, liberar la ambulancia
        if ($traslado['estado'] === 'en_curso') {
            $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
            $stmt->execute([':matricula' => $traslado['matricula']]);
        }
    }

    // 4. Borrar el elemento
    $stmt = $pdo->prepare("DELETE FROM no_biologico WHERE id = :id");
    $stmt->execute([':id' => $id]);

    $pdo->commit();

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el insumo.']);
}
