
<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$hora_salida = $_POST['hora_salida'] ?? '';
$hora_llegada = $_POST['hora_llegada'] ?? '';
$chofer = $_POST['chofer'] ?? '';
$copiloto = $_POST['copiloto'] ?? '';
$id_paciente = $_POST['id_paciente'] ?? '';
$id_funcionario = $_POST['id_funcionario'] ?? '';
$matricula = $_POST['matricula'] ?? '';

try {

    $stmt = $pdo->prepare(
        "INSERT INTO traslado
        (hora_salida, hora_llegada, chofer, copiloto,
        id_paciente, id_funcionario, matricula)
        VALUES
        (:hora_salida, :hora_llegada, :chofer, :copiloto,
        :id_paciente, :id_funcionario, :matricula)"
    );

    $stmt->execute([
        ':hora_salida' => $hora_salida,
        ':hora_llegada' => $hora_llegada,
        ':chofer' => $chofer,
        ':copiloto' => $copiloto,
        ':id_paciente' => $id_paciente,
        ':id_funcionario' => $id_funcionario,
        ':matricula' => $matricula
    ]);

    echo json_encode([
        'exito' => true
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'exito' => false,
        'mensaje' => 'No se pudo crear el traslado.'
    ]);

}
?>







