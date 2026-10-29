<?php
// eliminar_paciente.php
// Borra un paciente, pero solo si no deja datos "colgados":
//  - si tiene una cuenta (se registró en la página), no se borra: se marca como inactivo
//  - si tiene traslados registrados, tampoco: el historial se tiene que mantener
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el paciente a eliminar.']);
    exit();
}

try {
    // 1. Buscar el paciente para saber su cédula
    $stmt = $pdo->prepare("SELECT cedula FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);
    $paciente = $stmt->fetch();

    if (!$paciente) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ese paciente ya no existe. Recargá la página.']);
        exit();
    }

    // 2. ¿Tiene una cuenta para iniciar sesión? (está en la tabla Persona con la misma cédula)
    $stmt = $pdo->prepare("SELECT cedula FROM Persona WHERE cedula = :cedula");
    $stmt->execute([':cedula' => $paciente['cedula']]);

    if ($stmt->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: el paciente tiene una cuenta registrada. Podés marcarlo como Inactivo.']);
        exit();
    }

    // 3. ¿Tiene traslados registrados?
    $stmt = $pdo->prepare("SELECT id_traslado FROM Traslado WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);

    if ($stmt->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: el paciente tiene traslados registrados. Podés marcarlo como Inactivo.']);
        exit();
    }

    // 4. Si no tiene nada asociado, se borra
    $stmt = $pdo->prepare("DELETE FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el paciente.']);
}
