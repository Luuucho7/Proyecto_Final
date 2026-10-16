<?php
// Muestra el PDF de un documento. Es la dirección a la que lleva el código QR:
// la abren los pacientes desde el celular, por eso NO pide iniciar sesión.
require_once 'conexion.php';
require_once 'archivo_pdf.php';

$id = $_GET['id'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT nombre, archivo FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);
    $documento = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo 'No se pudo consultar el documento. Intentá más tarde.';
    exit();
}

// Ruta completa del PDF en el servidor (si el documento no existe, queda vacía)
$ruta = $documento ? CARPETA_DOCUMENTOS . basename((string) $documento['archivo']) : '';

if (!$documento || !is_file($ruta)) {
    http_response_code(404);
    echo 'El documento no existe o ya no está disponible.';
    exit();
}

// Nombre del archivo sin tildes ni espacios, para que el navegador lo acepte sin problemas
$nombreDescarga = preg_replace('/[^A-Za-z0-9_-]+/', '_', $documento['nombre']) . '.pdf';

// Estos encabezados le dicen al navegador "lo que viene es un PDF, mostralo en pantalla"
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $nombreDescarga . '"');
header('Content-Length: ' . filesize($ruta));

// Manda el contenido del PDF al navegador
readfile($ruta);
