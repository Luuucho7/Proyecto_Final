<?php
// Crea un documento nuevo: guarda el PDF en la carpeta uploads y sus datos en la base
require_once 'conexion.php';
require_once 'archivo_pdf.php';

header('Content-Type: application/json');

$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');

if ($nombre === '' || $tipo === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el título y el tipo de documento.']);
    exit();
}

// Si el PDF superaba el límite de PHP, ni siquiera llega $_FILES
if (!isset($_FILES['archivo'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Elegí un archivo PDF para subir.']);
    exit();
}

// Primero se guarda el PDF; si no es válido, se corta acá
$resultado = guardarPdfSubido($_FILES['archivo']);

if (!$resultado['exito']) {
    echo json_encode(['exito' => false, 'mensaje' => $resultado['mensaje']]);
    exit();
}

try {
    // CURDATE() pone la fecha de hoy automáticamente
    $stmt = $pdo->prepare("INSERT INTO Documentacion (nombre, tipo, fecha_creacion, archivo) VALUES (:nombre, :tipo, CURDATE(), :archivo)");
    $stmt->execute([
        ':nombre' => $nombre,
        ':tipo' => $tipo,
        ':archivo' => $resultado['archivo']
    ]);
    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    // Si falló la base, borramos el PDF recién guardado para no dejar archivos sueltos
    borrarPdf($resultado['archivo']);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el documento.']);
}
