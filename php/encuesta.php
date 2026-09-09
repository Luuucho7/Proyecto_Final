<?php
require_once 'conexion.php';

// Si alguien entra directo por la URL (sin enviar el formulario), lo mandamos al formulario
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/encuestaformulario.html');
    exit();
}

// Datos que llegan del formulario
$nombre        = trim($_POST['nombre'] ?? '');
$edad          = filter_input(INPUT_POST, 'edad', FILTER_VALIDATE_INT);
$servicio      = trim($_POST['servicio'] ?? '');
$atencion      = trim($_POST['atencion'] ?? '');
$amabilidad    = trim($_POST['amabilidad'] ?? '');
$informacion   = trim($_POST['informacion'] ?? '');
$instalaciones = filter_input(INPUT_POST, 'instalaciones', FILTER_VALIDATE_INT);
$recomendacion = trim($_POST['recomendacion'] ?? '');
$comentarios   = trim($_POST['comentarios'] ?? '');

// Controlamos que los campos obligatorios estén completos
$obligatorios = [$edad, $servicio, $atencion, $amabilidad, $informacion, $instalaciones, $recomendacion];
foreach ($obligatorios as $campo) {
    if ($campo === false || $campo === null || $campo === '') {
        http_response_code(400);
        exit('Por favor, completá todos los campos requeridos.');
    }
}

// Guardamos la encuesta en la base de datos
try {
    $sql = "INSERT INTO Encuesta (nombre, edad, servicio, atencion, amabilidad, informacion, instalaciones, recomendacion, comentarios)
            VALUES (:nombre, :edad, :servicio, :atencion, :amabilidad, :informacion, :instalaciones, :recomendacion, :comentarios)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nombre'        => $nombre,
        ':edad'          => $edad,
        ':servicio'      => $servicio,
        ':atencion'      => $atencion,
        ':amabilidad'    => $amabilidad,
        ':informacion'   => $informacion,
        ':instalaciones' => $instalaciones,
        ':recomendacion' => $recomendacion,
        ':comentarios'   => $comentarios
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    exit('No se pudo guardar la encuesta. Intentá más tarde.');
}

// Preparamos los textos para mostrarlos sin riesgo en la página de gracias
$nombreSeguro = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
$servicioSeguro = htmlspecialchars($servicio, ENT_QUOTES, 'UTF-8');

?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Encuesta recibida</title>
    <link rel="stylesheet" href="../css/encuesta.css">
</head>
<body>
    <main class="contenedor">
        <h1>Encuesta recibida</h1>
        <p class="descripcion">Gracias<?php if ($nombreSeguro !== '') { echo ', ' . $nombreSeguro; } ?>. Tu opinión sobre <?php echo $servicioSeguro; ?> fue registrada.</p>
        <a href="../html/pagina_principal.html" class="boton-volver">Ir al inicio</a>
    </main>
</body>
</html>