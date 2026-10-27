<?php
// modificar_traslado.php
// Cambia los datos de un traslado que ya existe: ambulancia, chofer, copiloto, horas y paciente.
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
    return $valor === '' ? null : $valor;
}

// El input de hora manda "14:30"; la columna es TIME ("14:30:00")
function hora($valor) {
    $valor = opcional($valor);
    return $valor === null ? null : date('H:i:s', strtotime($valor));
}

try {
    $pdo->beginTransaction();

    // 1. Buscar el traslado para saber qué ambulancia tenía hasta ahora
    $stmt = $pdo->prepare("SELECT matricula FROM Traslado WHERE id_traslado = :id");
    $stmt->execute([':id' => $id]);
    $traslado = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$traslado) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'El traslado no existe.']);
        exit();
    }

    // 2. Si cambió de ambulancia: la nueva tiene que estar libre,
    //    la vieja vuelve a quedar libre y la nueva pasa a "En servicio"
    if ($matricula !== $traslado['matricula']) {
        $stmt = $pdo->prepare("SELECT estado FROM Ambulancia WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $matricula]);
        $ambulancia = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ambulancia) {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no existe.']);
            exit();
        }

        if ($ambulancia['estado'] !== 'libre') {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no está disponible.']);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'libre' WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $traslado['matricula']]);

        $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'en_servicio' WHERE matricula = :matricula");
        $stmt->execute([':matricula' => $matricula]);
    }

    // 3. Si se indicó un paciente, tiene que existir
    $id_paciente = opcional($_POST['id_paciente'] ?? '');

    if ($id_paciente !== null) {
        $stmt = $pdo->prepare("SELECT id_paciente FROM Paciente WHERE id_paciente = :id_paciente");
        $stmt->execute([':id_paciente' => $id_paciente]);

        if (!$stmt->fetch()) {
            $pdo->rollBack();
            echo json_encode(['exito' => false, 'mensaje' => 'El paciente indicado no existe.']);
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
        ':hora_salida' => hora($_POST['hora_salida'] ?? ''),
        ':hora_llegada' => hora($_POST['hora_llegada'] ?? ''),
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
