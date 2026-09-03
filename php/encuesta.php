<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../html/encuestaformulario.html');
    exit();
}

$nombre = trim($_POST['nombre'] ?? '');
$edad = filter_input(INPUT_POST, 'edad', FILTER_VALIDATE_INT);
$servicio = trim($_POST['servicio'] ?? '');
$atencion = trim($_POST['atencion'] ?? '');
$amabilidad = trim($_POST['amabilidad'] ?? '');
$informacion = trim($_POST['informacion'] ?? '');
$instalaciones = filter_input(INPUT_POST, 'instalaciones', FILTER_VALIDATE_INT);
$recomendacion = trim($_POST['recomendacion'] ?? '');
$comentarios = trim($_POST['comentarios'] ?? '');

$camposRequeridos = [$edad, $servicio, $atencion, $amabilidad, $informacion, $instalaciones, $recomendacion];
foreach ($camposRequeridos as $campo) {
    if ($campo === false || $campo === null || $campo === '') {
        http_response_code(400);
        exit('Por favor, completa todos los campos requeridos.');
    }
}

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
        <p class="descripcion">Gracias<?php echo $nombreSeguro !== '' ? ', ' . $nombreSeguro : ''; ?>. Tu opinion sobre <?php echo $servicioSeguro; ?> fue registrada.</p>
        <a href="../html/pagina_principal.html">Volver al inicio</a>
    </main>
</body>
</html>
