<?php
$host     = 'localhost';
$dbname   = 'hospital_clinicas_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    $aviso = 'No hay conexión con la base de datos. Revisá que MySQL esté encendido en XAMPP.';

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'exito'   => false,
        'mensaje' => $aviso,
        'success' => false,
        'message' => $aviso
    ]);
    exit();
}
?>
