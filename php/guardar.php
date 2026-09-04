<?php
header("Content-Type: application/json; charset=UTF-8");

$servidor = "localhost";
$usuario  = "root";
$password = "";
$dbname   = "hospital_clinicas";

// 1. Conexión a la base de datos
$conexion = mysqli_connect($servidor, $usuario, $password, $dbname);

if (!$conexion) {
    echo json_encode("error_conexion");
    exit();
}

// 2. Lectura de datos enviados por JavaScript
$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos) {
    echo json_encode("Sin datos recibidos");
    exit();
}

// 3. Sanitizado básico de datos
$nombre   = mysqli_real_escape_string($conexion, $datos['nombre']);
$cedula   = mysqli_real_escape_string($conexion, $datos['cedula']);
$telefono = mysqli_real_escape_string($conexion, $datos['telefono']);
$estado   = mysqli_real_escape_string($conexion, $datos['estado']);

// 4. Consulta SQL apuntando a la tabla 'paciente' (singular)
$sql = "INSERT INTO paciente (nombre, cedula, telefono, estado) 
        VALUES ('$nombre', '$cedula', '$telefono', '$estado')";

// 5. Ejecución
if (mysqli_query($conexion, $sql)) {
    echo json_encode("ok");
} else {
    echo json_encode(mysqli_error($conexion));
}

mysqli_close($conexion);
?>