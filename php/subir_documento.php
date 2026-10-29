<?php
require_once 'conexion.php';

header('Content-Type: application/json');

$tipo = trim($_POST['tipo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');

if ($tipo === '' || $descripcion === '' || !isset($_FILES['archivo'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Complete todos los campos antes de subir el documento.']);
    exit();
}

if (mb_strlen($descripcion) > 100) {
    echo json_encode(['exito' => false, 'mensaje' => 'La descripción es demasiado larga (máximo 100 caracteres).']);
    exit();
}

$archivo = $_FILES['archivo'];

if ($archivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo recibir el archivo. Probá de nuevo.']);
    exit();
}

$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));

if ($extension !== 'pdf') {
    echo json_encode(['exito' => false, 'mensaje' => 'El archivo tiene que ser un PDF.']);
    exit();
}

$nombreArchivo = 'documento_' . time() . '_' . rand(100, 999) . '.pdf';
$destino = __DIR__ . '/../documentos/' . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el archivo en la carpeta documentos.']);
    exit();
}

try {
    $stmt = $pdo->prepare(
        "INSERT INTO Documentacion (nombre, tipo, archivo, fecha_creacion, id_funcionario)
         VALUES (:nombre, :tipo, :archivo, CURDATE(), NULL)"
    );
    $stmt->execute([
        ':nombre' => $descripcion,
        ':tipo' => $tipo,
        ':archivo' => $nombreArchivo
    ]);

    echo json_encode(['exito' => true, 'id_documento' => $pdo->lastInsertId()]);

} catch (PDOException $e) {
    unlink($destino);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo registrar el documento.']);
}
