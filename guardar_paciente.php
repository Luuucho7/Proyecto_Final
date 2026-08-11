<?php

include "conexion.php";


$ci = $_POST["ci"];
$nombre = $_POST["nombre"];
$apellido = $_POST["apellido"];
$fecha_nacimiento = $_POST["fecha_nacimiento"];
$telefono = $_POST["telefono"];
$estado = $_POST["estado"];


$sql = "INSERT INTO pacientes
        (ci, nombre, apellido, fecha_nacimiento, telefono, estado)
        VALUES (?, ?, ?, ?, ?, ?)";


$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ssssss",
    $ci,
    $nombre,
    $apellido,
    $fecha_nacimiento,
    $telefono,
    $estado
);


if ($stmt->execute()) {

    header("Location: ../html/pacientes.php");

    exit();

} else {

    echo "Error al guardar el paciente: " . $conn->error;

}


$stmt->close();

$conn->close();

?><?php

include "conexion.php";


$ci = $_POST["ci"];
$nombre = $_POST["nombre"];
$apellido = $_POST["apellido"];
$fecha_nacimiento = $_POST["fecha_nacimiento"];
$telefono = $_POST["telefono"];
$estado = $_POST["estado"];


$sql = "INSERT INTO pacientes
        (ci, nombre, apellido, fecha_nacimiento, telefono, estado)
        VALUES (?, ?, ?, ?, ?, ?)";


$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ssssss",
    $ci,
    $nombre,
    $apellido,
    $fecha_nacimiento,
    $telefono,
    $estado
);


if ($stmt->execute()) {

    header("Location: ../html/pacientes.php");

    exit();

} else {

    echo "Error al guardar el paciente: " . $conn->error;

}


$stmt->close();

$conn->close();

?>