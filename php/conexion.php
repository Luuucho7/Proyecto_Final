<?php
// Datos para conectarse a la base de datos MySQL (XAMPP por defecto: usuario "root" sin contraseña)
$host     = 'localhost';
$dbname   = 'hospital_clinicas';
$username = 'root';
$password = '';

// Este archivo lo incluye (require_once) cada PHP que necesita hablar con la base.
// $pdo queda disponible en el archivo que hizo el require_once.
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // si algo falla, tira una excepción (se puede atrapar con try/catch)
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC    // los resultados vienen como array asociativo: $fila['nombre']
    ]);
} catch (PDOException $e) {
    // Si no se pudo conectar (ej: XAMPP apagado), corta la ejecución con un mensaje claro
    die("Error de conexión a la base de datos: " . $e->getMessage());
}
?>