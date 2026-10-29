<?php
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el paciente a eliminar.']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT cedula FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);
    $paciente = $stmt->fetch();

    if (!$paciente) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ese paciente ya no existe. Recargá la página.']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT cedula FROM Persona WHERE cedula = :cedula");
    $stmt->execute([':cedula' => $paciente['cedula']]);

    if ($stmt->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: el paciente tiene una cuenta registrada. Podés marcarlo como Inactivo.']);
        exit();
    }

    $stmt = $pdo->prepare("SELECT id_traslado FROM Traslado WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);

    if ($stmt->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: el paciente tiene traslados registrados. Podés marcarlo como Inactivo.']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM Paciente WHERE id_paciente = :id");
    $stmt->execute([':id' => $id]);
    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el paciente.']);
}
