<?php
// ver_documento.php
// Página PÚBLICA: es la que abre el paciente cuando escanea el QR con el celular.
// Por eso NO pide iniciar sesión y NO tiene el menú del funcionario.
// Se usa así: ver_documento.php?id=3

require_once 'conexion.php';

// 1. Leer el id que viene en la URL
$id = $_GET['id'] ?? '';

// 2. Buscar el documento en la base de datos
$documento = false;

if ($id !== '') {
    $stmt = $pdo->prepare("SELECT nombre, tipo, archivo, fecha_creacion FROM Documentacion WHERE id_documento = :id");
    $stmt->execute([':id' => $id]);
    $documento = $stmt->fetch();
}

// 3. Revisar que el PDF exista de verdad en la carpeta documentos/
$hayArchivo = false;

if ($documento) {
    $rutaArchivo = __DIR__ . '/../documentos/' . $documento['archivo'];

    if (is_file($rutaArchivo)) {
        $hayArchivo = true;
    }
}

// 4. Preparar los textos para mostrarlos sin riesgo (htmlspecialchars evita que se ejecute HTML)
$nombre = '';
$tipo = '';
$fecha = '';
$enlace = '';

if ($documento) {
    $nombre = htmlspecialchars($documento['nombre'], ENT_QUOTES, 'UTF-8');
    $tipo = htmlspecialchars($documento['tipo'], ENT_QUOTES, 'UTF-8');
    $fecha = date('d/m/Y', strtotime($documento['fecha_creacion']));
    $enlace = '../documentos/' . rawurlencode($documento['archivo']);
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento para pacientes - Hospital de Clínicas</title>
    <link rel="stylesheet" href="../css/documento_publico.css">
</head>
<body>

    <header class="encabezado">
        <img src="../css/img/hospital_logo.svg" alt="" class="encabezado-icono">
        <div>
            <p class="encabezado-nombre">Hospital de Clínicas</p>
            <p class="encabezado-texto">Información para pacientes</p>
        </div>
    </header>

    <main class="documento">

        <?php if ($documento) { ?>

            <p class="etiqueta"><?php echo $tipo; ?></p>
            <h1><?php echo $nombre; ?></h1>
            <p class="fecha"><span>Publicado el</span> <?php echo $fecha; ?></p>

            <?php if ($hayArchivo) { ?>

                <a class="boton boton-principal" href="<?php echo $enlace; ?>" target="_blank">Ver documento</a>
                <a class="boton boton-secundario" href="<?php echo $enlace; ?>" download>Descargar PDF</a>

                <p class="ayuda">El documento se abre en el visor de PDF de tu celular. No hace falta instalar nada.</p>

            <?php } else { ?>

                <p class="aviso">Este documento todavía no está disponible. Consultá en el mostrador de atención.</p>

            <?php } ?>

        <?php } else { ?>

            <h1>Documento no encontrado</h1>
            <p class="aviso">El código QR no corresponde a ningún documento. Probá escanearlo de nuevo o consultá en el mostrador de atención.</p>

        <?php } ?>

        <div class="encuesta">
            <p>¿Nos ayudás a mejorar?</p>
            <a href="../html/encuestaformulario.html">Completar la encuesta de satisfacción</a>
        </div>

    </main>

    <footer class="pie">
        Hospital de Clínicas · Av. Italia s/n, Montevideo
    </footer>

    <script src="../js/idioma.js"></script>


</body>
</html>
