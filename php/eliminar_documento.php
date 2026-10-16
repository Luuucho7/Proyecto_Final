<?php
// Borra un documento: su fila en la base y también su PDF de la carpeta uploads.
// Documentacion.js pide confirm() antes de llamar a este archivo.
require_once 'conexion.php';
require_once 'archivo_pdf.php';

header('Content-Type: application/json');

$id = trim($_POST['id'] ?? '');

if ($id === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Falta el documento a eliminar.']);
    exit();
}

try {
    // Antes de borrar la fila, guardamos el nombre de su PDF
    $stmt = $pdo->prepare("SELECT archivo FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);
    $documento = $stmt->fetch();

    if (!$documento) {
        echo json_encode(['exito' => false, 'mensaje' => 'El documento no existe.']);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);

    borrarPdf($documento['archivo']);

    echo json_encode(['exito' => true]);
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo eliminar el documento.']);
}
