<?php
// Funciones compartidas para guardar y borrar los PDF de los documentos.
// Los PDF se guardan en la carpeta uploads/documentos/ (el PHP la crea si no existe).

define('CARPETA_DOCUMENTOS', __DIR__ . '/../uploads/documentos/');
define('PESO_MAXIMO_PDF', 10 * 1024 * 1024); // 10 MB

// Revisa el archivo que llegó en $_FILES y, si es un PDF válido, lo guarda con un nombre único.
// Devuelve un array:  ['exito' => true,  'archivo' => 'nombre_guardado.pdf']
//                 o   ['exito' => false, 'mensaje' => 'qué salió mal']
function guardarPdfSubido($archivo) {

    if ($archivo['error'] === UPLOAD_ERR_NO_FILE) {
        return ['exito' => false, 'mensaje' => 'Elegí un archivo PDF para subir.'];
    }

    if ($archivo['error'] === UPLOAD_ERR_INI_SIZE || $archivo['error'] === UPLOAD_ERR_FORM_SIZE) {
        return ['exito' => false, 'mensaje' => 'El archivo es demasiado grande.'];
    }

    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        return ['exito' => false, 'mensaje' => 'No se pudo subir el archivo.'];
    }

    if ($archivo['size'] > PESO_MAXIMO_PDF) {
        return ['exito' => false, 'mensaje' => 'El PDF no puede pesar más de 10 MB.'];
    }

    // Se revisan DOS cosas: la extensión del nombre y el tipo REAL del contenido del archivo,
    // porque alguien podría renombrar otro tipo de archivo a ".pdf"
    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $tipoReal = mime_content_type($archivo['tmp_name']);

    if ($extension !== 'pdf' || $tipoReal !== 'application/pdf') {
        return ['exito' => false, 'mensaje' => 'Solo se permiten archivos PDF.'];
    }

    // Si la carpeta todavía no existe, se crea
    if (!is_dir(CARPETA_DOCUMENTOS)) {
        mkdir(CARPETA_DOCUMENTOS, 0777, true);
    }

    // Nombre al azar: nunca se pisan dos archivos y no se usa el nombre que mandó el usuario
    $nombreGuardado = bin2hex(random_bytes(8)) . '.pdf';

    // Mueve el archivo desde la carpeta temporal de PHP hasta su lugar definitivo
    if (!move_uploaded_file($archivo['tmp_name'], CARPETA_DOCUMENTOS . $nombreGuardado)) {
        return ['exito' => false, 'mensaje' => 'No se pudo guardar el archivo en el servidor.'];
    }

    return ['exito' => true, 'archivo' => $nombreGuardado];
}

// Borra un PDF de la carpeta (si existe)
function borrarPdf($nombreGuardado) {

    if (empty($nombreGuardado)) {
        return;
    }

    // basename() deja solo el nombre del archivo, así no se puede borrar nada fuera de la carpeta
    $ruta = CARPETA_DOCUMENTOS . basename($nombreGuardado);

    if (is_file($ruta)) {
        unlink($ruta);
    }
}
