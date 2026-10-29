<?php
// modificar_traslado.php
// Cambia los datos de un traslado que ya existe: ambulancia, chofer, copiloto, fechas y paciente.
// (El elemento que se traslada se modifica desde la sección "Elementos registrados" de Traslado.html)
require_once 'conexion.php';

header('Content-Type: application/json');

$id = trim($_POST['id_traslado'] ?? '');
$matricula = trim($_POST['matricula'] ?? '');

if ($id === '' || $matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
    exit();
}

// Los campos opcionales vacíos se guardan como NULL
function opcional($valor) {
    $valor = trim($valor ?? '');

    if ($valor === '') {
        return null;
    }
    return $valor;
}

// El input datetime-local manda "2026-10-19T14:30". La columna es DATETIME ("2026-10-19 14:30:00").
// Devuelve null si está vacío y false si lo escrito no es una fecha válida.
function fecha($valor) {
    $valor = opcional($valor);

    if ($valor === null) {
        return null;
    }

    $tiempo = strtotime($valor);

    if ($tiempo === false) {
        return false;
    }
    return date('Y-m-d H:i:s', $tiempo);
}

// ---------- Revisar las fechas ----------
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

    // 1. Buscar el traslado para saber qué ambulancia y qué paciente tenía hasta ahora
    $stmt = $pdo->prepare("SELECT matricula, id_paciente, estado FROM Traslado WHERE id_traslado = :id");
    $stmt->execute([':id' => $id]);
    $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$traslado) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado no existe.']);
        exit();
    }

    // Un traslado finalizado ya no se modifica (su ambulancia ya se liberó)
    if ($traslado['estado'] === 'finalizado') {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado ya está finalizado y no se puede modificar.']);
        exit();
    }

    // 2. Si cambió de ambulancia: la nueva tiene que estar libre y pasa a "En servicio".
    //    La vieja vuelve a "Libre", pero SOLO si estaba "En servicio" por este traslado.
    //    (Si alguien la había puesto "Ocupada", por ejemplo porque está en el taller, se respeta)
    if ($matricula !== $traslado['matricula']) {

        // Ocupar la nueva solo si sigue libre (rowCount = cuántas filas cambió el UPDATE)
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

    // 3. Si se eligió un paciente, tiene que existir.
    //    Si es un paciente NUEVO para este traslado, además tiene que estar activo.
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

    // 4. Guardar los cambios
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
