<?php
// finalizar_traslado.php
// Marca un traslado como "finalizado" y deja su ambulancia libre otra vez.
// Lo usa el botón "Finalizar" de traslados_lista.html
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede finalizar traslados
require_once 'conexion.php';

header('Content-Type: application/json');

$id = trim($_POST['id_traslado'] ?? '');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el traslado a finalizar.']);
    exit();
}

try {
    // Las dos cosas van juntas: si falla una, no se hace ninguna
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

    if ($traslado['estado'] === 'finalizado') {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado ya estaba finalizado.']);
        exit();
    }

    // 2. Marcar el traslado como finalizado
    $stmt = $pdo->prepare("UPDATE Traslado SET estado = 'finalizado' WHERE id_traslado = :id");
    $stmt->execute([':id' => $id]);

    // 3. Liberar la ambulancia (solo si estaba "En servicio"; si la pusieron "Ocupada" a mano, se respeta)
    $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
    $stmt->execute([':matricula' => $traslado['matricula']]);

    $pdo->commit();

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo finalizar el traslado.']);
}
