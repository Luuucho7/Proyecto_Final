<?php
// subir_documento.php
// Recibe un PDF desde Documentacion.html, lo guarda en la carpeta documentos/
// y lo registra en la tabla Documentacion. Después ya se le puede generar el QR.
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede subir documentos
require_once 'conexion.php';

header('Content-Type: application/json');

$tipo = trim($_POST['tipo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');

// 1. Revisar que estén todos los datos
if ($tipo === '' || $descripcion === '' || !isset($_FILES['archivo'])) {
    echo json_encode(['exito' => false, 'mensaje' => 'Complete todos los campos antes de subir el documento.']);
    exit();
}

// La columna "nombre" acepta como máximo 100 letras
if (mb_strlen($descripcion) > 100) {
    echo json_encode(['exito' => false, 'mensaje' => 'La descripción es demasiado larga (máximo 100 caracteres).']);
    exit();
}

$archivo = $_FILES['archivo'];

// 2. Revisar que el archivo haya llegado bien
if ($archivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo recibir el archivo. Probá de nuevo.']);
    exit();
}

// 3. Solo se aceptan PDF (los pacientes lo abren desde el celular)
$extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));

if ($extension !== 'pdf') {
    echo json_encode(['exito' => false, 'mensaje' => 'El archivo tiene que ser un PDF.']);
    exit();
}

// 4. Guardar el archivo con un nombre nuevo, para que no pise a otro que se llame igual
$nombreArchivo = 'documento_' . time() . '_' . rand(100, 999) . '.pdf';
$destino = __DIR__ . '/../documentos/' . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo guardar el archivo en la carpeta documentos.']);
    exit();
}

// 5. Registrarlo en la base de datos
try {
    $stmt = $pdo->prepare(
        "INSERT INTO Documentacion (nombre, tipo, archivo, fecha_creacion, id_funcionario)
         VALUES (:nombre, :tipo, :archivo, CURDATE(), :id_funcionario)"
    );
    $stmt->execute([
        ':nombre' => $descripcion,
        ':tipo' => $tipo,
        ':archivo' => $nombreArchivo,
        ':id_funcionario' => $_SESSION['id_funcionario']
    ]);

    echo json_encode(['exito' => true, 'id_documento' => $pdo->lastInsertId()]);

} catch (PDOException $e) {
    // Si no se pudo registrar, se borra el archivo para que no quede un PDF suelto
    unlink($destino);
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo registrar el documento.']);
}
