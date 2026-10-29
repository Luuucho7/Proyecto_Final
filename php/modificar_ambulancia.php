<?php
// modificar_ambulancia.php
// Cambia el estado de una ambulancia. La matrícula no se puede cambiar:
// es su identificador y los traslados ya registrados la usan.
require_once 'conexion.php';

$matricula = trim($_POST['id'] ?? '');
$estado = trim($_POST['estado'] ?? 'libre');

header('Content-Type: application/json');

if ($matricula === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar.']);
    exit();
}

if (!in_array($estado, ['libre', 'ocupada', 'en_servicio'], true)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El estado no es válido.']);
    exit();
}

try {
    // 1. La ambulancia tiene que existir (por si la eliminaron mientras se estaba editando)
    $verificar = $pdo->prepare("SELECT matricula FROM Ambulancia WHERE matricula = :matricula");
    $verificar->execute([':matricula' => $matricula]);

    if (!$verificar->fetch()) {
        echo json_encode(['exito' => false, 'mensaje' => 'Esa ambulancia ya no existe. Recargá la página.']);
        exit();
    }

    // 2. Si tiene un traslado en curso, tiene que seguir "En servicio".
    //    Si no, se podría poner "Libre" y asignarla a otro traslado al mismo tiempo.
    if ($estado !== 'en_servicio') {
        $enCurso = $pdo->prepare("SELECT id_traslado FROM Traslado WHERE matricula = :matricula AND estado <> 'finalizado'");
        $enCurso->execute([':matricula' => $matricula]);
        $traslado = $enCurso->fetch();

        if ($traslado) {
            echo json_encode(['exito' => false, 'mensaje' => 'La ambulancia tiene un traslado en curso (Nº ' . $traslado['id_traslado'] . '). Finalizá ese traslado primero.']);
            exit();
        }
    }

    // 3. Guardar el estado nuevo
    $stmt = $pdo->prepare("UPDATE Ambulancia SET estado = :estado WHERE matricula = :matricula");
    $stmt->execute([
        ':matricula' => $matricula,
        ':estado' => $estado
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar la ambulancia.']);
}
