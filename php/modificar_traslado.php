<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$id = trim($_POST['id_traslado'] ?? '');
$matricula = trim($_POST['matricula'] ?? '');

if ($id === '' || $matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
    exit();
}

require_once 'funciones_traslado.php';

$salida = fecha($_POST['hora_salida'] ?? '');
$llegada = fecha($_POST['hora_llegada'] ?? '');

if ($salida === false || $llegada === false) {
    echo json_encode(['exito' => false, 'mensaje' => 'La fecha de salida o de llegada no es válida.']);
    exit();
}

if ($salida !== null && $llegada !== null) {
    if (strtotime($llegada) <= strtotime($salida)) {
        echo json_encode(['exito' => false, 'mensaje' => 'La llegada tiene que ser después de la salida.']);
        exit();
    }
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT matricula, id_paciente, estado FROM Traslado WHERE id_traslado = :id");
    $stmt->execute([':id' => $id]);
    $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$traslado) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado no existe.']);
        exit();
    }

    if ($traslado['estado'] === 'finalizado') {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado ya está finalizado y no se puede modificar.']);
        exit();
    }

    if ($matricula !== $traslado['matricula']) {

        $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'en_servicio' WHERE matricula = :matricula AND estado = 'libre'");
        $stmt->execute([':matricula' => $matricula]);

        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no está disponible.']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula AND estado = 'en_servicio'");
        $stmt->execute([':matricula' => $traslado['matricula']]);
    }

    $id_paciente = opcional($_POST['id_paciente'] ?? '');

    if ($id_paciente !== null) {
        $stmt = $pdo->prepare("SELECT estado FROM Paciente WHERE id_paciente = :id_paciente");
        $stmt->execute([':id_paciente' => $id_paciente]);
        $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$paciente) {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'El paciente elegido no existe.']);
            exit();
        }

        $esElMismoPaciente = ((string) $id_paciente === (string) $traslado['id_paciente']);

        if (!$esElMismoPaciente && $paciente['estado'] !== 'activo') {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'El paciente elegido está inactivo.']);
            exit();
        }
    }

    $stmt = $pdo->prepare(
        "UPDATE Traslado
         SET hora_salida = :hora_salida, hora_llegada = :hora_llegada,
             chofer = :chofer, copiloto = :copiloto,
             id_paciente = :id_paciente, matricula = :matricula
         WHERE id_traslado = :id"
    );

    $stmt->execute([
        ':hora_salida' => $salida,
        ':hora_llegada' => $llegada,
        ':chofer' => opcional($_POST['chofer'] ?? ''),
        ':copiloto' => opcional($_POST['copiloto'] ?? ''),
        ':id_paciente' => $id_paciente,
        ':matricula' => $matricula,
        ':id' => $id
    ]);

    $pdo->commit();

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el traslado.']);
}
