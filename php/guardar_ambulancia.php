<?php
require_once 'conexion.php';

$matricula = mb_strtoupper(trim($_POST['matricula'] ?? ''));
$estado = trim($_POST['estado'] ?? 'libre');

header('Content-Type: application/json');

if ($matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá la matrícula.']);
    exit();
}

if (mb_strlen($matricula) > 20) {
    echo json_encode(['exito' => false, 'mensaje' => 'La matrícula es demasiado larga (máximo 20 caracteres).']);
    exit();
}

if (!in_array($estado, ['libre', 'ocupada', 'en_servicio'], true)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El estado no es válido.']);
    exit();
}

try {
    $verificar = $pdo->prepare("SELECT matricula FROM Ambulancia WHERE matricula = :matricula");
    $verificar->execute([':matricula' => $matricula]);

    if ($verificar->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe una ambulancia con esa matrícula.']);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO Ambulancia (matricula, estado) VALUES (:matricula, :estado)");
    $stmt->execute([
        ':matricula' => $matricula,
        ':estado' => $estado
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar la ambulancia.']);
}
