<?php
// guardar_documento.php
// Recibe el formulario "Subir Documento":
//   1. guarda el PDF en la carpeta documentos/
//   2. guarda los datos del documento en la tabla Documentacion
require_once 'conexion.php';

header('Content-Type: application/json');

$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');

// Los únicos tipos permitidos (los mismos que usa la base y el formulario)
$tiposValidos = ['Indicaciones', 'Preparación para estudios', 'Enfermería', 'Prevención', 'Encuesta'];

// ---------- 1. Revisar los datos de texto ----------
if ($nombre === '' || $tipo === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Completá el tipo y el nombre del documento.']);
    exit();
}

if (!in_array($tipo, $tiposValidos, true)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El tipo de documento no es válido.']);
    exit();
}

// La columna "nombre" de la base acepta como máximo 100 letras
if (mb_strlen($nombre) > 100) {
    echo json_encode(['exito' => false, 'mensaje' => 'El nombre es demasiado largo (máximo 100 letras).']);
    exit();
}

// ---------- 2. Revisar el archivo ----------
// Si el archivo es más grande de lo que permite PHP, $_FILES llega vacío o con error
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['exito' => false, 'mensaje' => 'Elegí un archivo PDF para subir.']);
    exit();
}

$archivo = $_FILES['archivo'];

// Que termine en .pdf
$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
if ($extension !== 'pdf') {
    echo json_encode(['exito' => false, 'mensaje' => 'El archivo tiene que ser un PDF.']);
    exit();
}

// Que no pese más de 5 MB
if ($archivo['size'] > 5 * 1024 * 1024) {
    echo json_encode(['exito' => false, 'mensaje' => 'El PDF pesa más de 5 MB.']);
    exit();
}

// Que de verdad sea un PDF: todos los PDF empiezan con las letras "%PDF"
$inicio = file_get_contents($archivo['tmp_name'], false, null, 0, 4);
if ($inicio !== '%PDF') {
    echo json_encode(['exito' => false, 'mensaje' => 'El archivo no es un PDF válido.']);
    exit();
}

// ---------- 3. Guardar el PDF en documentos/ ----------
// Nombre nuevo y único: no usamos el nombre original para que nadie pueda pisar otro archivo
$nombreArchivo = uniqid('doc_') . '.pdf';
$rutaDestino = __DIR__ . '/../documentos/' . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el archivo en el servidor.']);
    exit();
}

// ---------- 4. Guardar los datos en la base ----------
try {
    // CURDATE() pone la fecha de hoy automáticamente
    $stmt = $pdo->prepare("INSERT INTO Documentacion (nombre, tipo, archivo, fecha_creacion) VALUES (:nombre, :tipo, :archivo, CURDATE())");
    $stmt->execute([
        ':nombre' => $nombre,
        ':tipo' => $tipo,
        ':archivo' => $nombreArchivo
    ]);

    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    // Si falló la base, borramos el PDF recién guardado para no dejar archivos sueltos
    unlink($rutaDestino);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el documento.']);
}
