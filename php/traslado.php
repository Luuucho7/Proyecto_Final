<?php
require_once 'conexion.php';

header('Content-Type: application/json');

// Cada tipo de traslado guarda su elemento en su propia tabla
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

// Solo se puede usar una ambulancia que esté libre. Aunque el formulario ya no deja elegir las otras,
// se vuelve a revisar acá, porque alguien podría mandar los datos sin pasar por el formulario.
try {
    $stmt = $pdo->prepare("SELECT estado FROM Ambulancia WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);
    $ambulancia = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo crear el traslado.']);
    exit();
}

if (!$ambulancia) {
    echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no existe.']);
    exit();
}

if ($ambulancia['estado'] !== 'libre') {
    echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia seleccionada no está disponible.']);
    exit();
}

// Los campos opcionales vacíos se guardan como NULL
function opcional($valor) {
    $valor = trim($valor ?? '');
    return $valor === '' ? null : $valor;
}

// El input datetime-local manda "2026-10-19T14:30", la columna es TIME
function hora($valor) {
    $valor = opcional($valor);
    return $valor === null ? null : date('H:i:s', strtotime($valor));
}

try {
    // El elemento y el traslado se guardan juntos: si falla uno, no se guarda ninguno
    $pdo->beginTransaction();

    $columnas = implode(', ', array_keys($elemento));
    $parametros = ':' . implode(', :', array_keys($elemento));

    $stmt = $pdo->prepare("INSERT INTO $tipo ($columnas) VALUES ($parametros)");
    $stmt->execute($elemento);
    $id_elemento = $pdo->lastInsertId();

    $stmt = $pdo->prepare(
        "INSERT INTO traslado
        (hora_salida, hora_llegada, chofer, copiloto,
        id_paciente, matricula, tipo_elemento, id_elemento)
        VALUES
        (:hora_salida, :hora_llegada, :chofer, :copiloto,
        :id_paciente, :matricula, :tipo_elemento, :id_elemento)"
    );

    $stmt->execute([
        ':hora_salida' => hora($_POST['hora_salida'] ?? ''),
        ':hora_llegada' => hora($_POST['hora_llegada'] ?? ''),
        ':chofer' => opcional($_POST['chofer'] ?? ''),
        ':copiloto' => opcional($_POST['copiloto'] ?? ''),
        ':id_paciente' => opcional($_POST['id_paciente'] ?? ''),
        ':matricula' => $matricula,
        ':tipo_elemento' => $tipo,
        ':id_elemento' => $id_elemento
    ]);

    $id_traslado = $pdo->lastInsertId();

    // La ambulancia elegida pasa a "En servicio" (se ve en la página de ambulancias).
    // Va dentro de la misma transacción: si algo falla, no queda ni el traslado ni el cambio de estado.
    $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = 'en_servicio' WHERE matricula = :matricula");
    $stmt->execute([':matricula' => $matricula]);

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
