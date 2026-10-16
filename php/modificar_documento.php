<?php
// Actualiza un documento que ya existe. El PDF es opcional: si no se elige uno nuevo, se conserva el actual.
require_once 'conexion.php';
require_once 'archivo_pdf.php';

header('Content-Type: application/json');

$id = trim($_POST['id'] ?? '');
$nombre = trim($_POST['nombre'] ?? '');
$tipo = trim($_POST['tipo'] ?? '');

if ($id === '' || $nombre === '' || $tipo === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Faltan datos para modificar el documento.']);
    exit();
}

$archivoGuardadoAhora = '';

try {
    // Buscamos el documento actual para saber cuál es su PDF
    $stmt = $pdo->prepare("SELECT archivo FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);
    $actual = $stmt->fetch();

    if (!$actual) {
        echo json_encode(['exito' => false, 'mensaje' => 'El documento no existe.']);
        exit();
    }

    $archivoFinal = $actual['archivo'];

    // ¿Eligieron un PDF nuevo? (error 4 = no se eligió ningún archivo)
    $hayArchivoNuevo = isset($_FILES['archivo']) && $_FILES['archivo']['error'] !== UPLOAD_ERR_NO_FILE;

    if ($hayArchivoNuevo) {
        $resultado = guardarPdfSubido($_FILES['archivo']);

        if (!$resultado['exito']) {
            echo json_encode(['exito' => false, 'mensaje' => $resultado['mensaje']]);
            exit();
        }

        $archivoGuardadoAhora = $resultado['archivo'];
        $archivoFinal = $archivoGuardadoAhora;
    }

    $stmt = $pdo->prepare("UPDATE Documentacion SET nombre = :nombre, tipo = :tipo, archivo = :archivo WHERE id_documento = :id");
    $stmt->execute([
        ':nombre' => $nombre,
        ':tipo' => $tipo,
        ':archivo' => $archivoFinal,
        ':id' => $id
    ]);

    // Recién ahora, con la base ya actualizada, se borra el PDF viejo
    if ($hayArchivoNuevo) {
        borrarPdf($actual['archivo']);
    }

    echo json_encode(['exito' => true]);

} catch (PDOException $e) {
    // Si algo falló, borramos el PDF nuevo (si es que se alcanzó a guardar)
    borrarPdf($archivoGuardadoAhora);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo modificar el documento.']);
}
