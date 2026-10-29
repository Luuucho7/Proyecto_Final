<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$tipos = [
    'biologico'    => ['nombre', 'estado'],
    'no_biologico' => ['clasificacion', 'pendiente'],
    'organo'       => ['persona', 'en_curso']
];

$tipo = $_POST['tipo'] ?? '';

if (!isset($tipos[$tipo])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Elegí qué se va a trasladar.']);
    exit();
}

$elemento = [];
foreach ($tipos[$tipo] as $campo) {
    $elemento[$campo] = trim($_POST[$campo] ?? '');

    if ($elemento[$campo] === '') {
        echo json_encode(['exito' => false, 'mensaje' => 'Completá los datos del elemento a trasladar.']);
        exit();
    }
}

$matricula = $_POST['matricula'] ?? '';

if ($matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Seleccioná una ambulancia.']);
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
    $stmt = $pdo->prepare("SELECT estado FROM Ambulancia WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $ambulancia = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ambulancia) {
        echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no existe.']);
        exit();
    }

    if ($ambulancia['estado'] !== 'libre') {
        echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no está disponible.']);
        exit();
    }

    $id_paciente = opcional($_POST['id_paciente'] ?? '');

    if ($id_paciente !== null) {
        $stmt = $pdo->prepare("SELECT estado FROM Paciente WHERE id_paciente = :id_paciente");
        $stmt->execute([':id_paciente' => $id_paciente]);
        $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$paciente) {
            echo json_encode(['exito' => false, 'mensaje' => 'El paciente elegido no existe.']);
            exit();
        }

        if ($paciente['estado'] !== 'activo') {
            echo json_encode(['exito' => false, 'mensaje' => 'El paciente elegido está inactivo.']);
            exit();
        }
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'en_servicio' WHERE matricula = :matricula AND estado = 'libre'");
    $stmt->execute([':matricula' => $matricula]);

    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no está disponible.']);
        exit();
    }

    $columnas = implode(', ', array_keys($elemento));
    $parametros = ':' . implode(', :', array_keys($elemento));

    $stmt = $pdo->prepare("INSERT INTO $tipo ($columnas) VALUES ($parametros)");
    $stmt->execute($elemento);
    $id_elemento = $pdo->lastInsertId();

    $stmt = $pdo->prepare(
        "INSERT INTO Traslado
        (hora_salida, hora_llegada, origen, destino, chofer, copiloto,
        id_paciente, matricula, tipo_elemento, id_elemento)
        VALUES
        (:hora_salida, :hora_llegada, :origen, :destino, :chofer, :copiloto,
        :id_paciente, :matricula, :tipo_elemento, :id_elemento)"
    );

    $stmt->execute([
        ':hora_salida' => $salida,
        ':hora_llegada' => $llegada,
        ':origen' => opcional($_POST['origen'] ?? ''),
        ':destino' => opcional($_POST['destino'] ?? ''),
        ':chofer' => opcional($_POST['chofer'] ?? ''),
        ':copiloto' => opcional($_POST['copiloto'] ?? ''),
        ':id_paciente' => $id_paciente,
        ':matricula' => $matricula,
        ':tipo_elemento' => $tipo,
        ':id_elemento' => $id_elemento
    ]);

    $id_traslado = $pdo->lastInsertId();

    $pdo->commit();

    echo json_encode([
        'exito' => true,
        'id_traslado' => $id_traslado
    ]);

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudo crear el traslado.'
    ]);

}
?>
