<?php
// eliminar_documento.php
// Borra un documento: su fila de la base y también su PDF de la carpeta documentos/
require_once 'conexion.php';

$id = trim($_POST['id'] ?? '');

header('Content-Type: application/json');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el documento a eliminar.']);
    exit();
}

try {
    // 1. Primero buscamos el nombre del PDF, porque después de borrar la fila ya no lo tendríamos
    $stmt = $pdo->prepare("SELECT archivo FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);
    $documento = $stmt->fetch();

    if (!$documento) {
        echo json_encode(['exito' => false, 'mensaje' => 'El documento no existe.']);
        exit();
    }

    // 2. Borramos la fila de la base
    $stmt = $pdo->prepare("DELETE FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);

    // 3. Borramos el PDF de la carpeta (basename deja solo el nombre del archivo, sin carpetas)
    $rutaArchivo = __DIR__ . '/../documentos/' . basename($documento['archivo']);

    if (is_file($rutaArchivo)) {
        unlink($rutaArchivo);
    }

    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el documento.']);
}
