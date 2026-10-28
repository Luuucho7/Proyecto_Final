<?php
// buscar_organo.php
// Busca en la tabla organo los registros cuyo "persona" CONTIENE lo escrito (no hace falta escribirlo entero).
// Devuelve TODOS los que coinciden, cada uno con el número de su traslado,
// porque cada traslado guarda su propio elemento y puede haber varios con el mismo nombre.
require_once 'verificar_sesion.php';   // solo un funcionario logueado puede usar este archivo
require_once 'conexion.php';

$persona = trim($_POST['persona'] ?? '');

header('Content-Type: application/json');

if ($persona === '') {
    echo json_encode(['exito' => false, 'mensaje' => 'Escribí el nombre de la persona para buscar.']);
    exit();
}

try {
    // LIKE con % adelante y atrás = "que contenga lo escrito"
    // LEFT JOIN con Traslado = traer también el número del traslado al que pertenece
    $stmt = $pdo->prepare(
        "SELECT e.id, e.persona, e.en_curso, t.id_traslado
         FROM organo e
         LEFT JOIN Traslado t ON t.tipo_elemento = 'organo' AND t.id_elemento = e.id
         WHERE e.persona LIKE :buscado
         ORDER BY e.id DESC"
    );
    $stmt->execute([':buscado' => '%' . $persona . '%']);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($resultados) > 0) {
        echo json_encode(['exito' => true, 'datos' => $resultados]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se encontró el registro.']);
    }
} catch (PDOException $e) {
    echo json_encode(['exito' => false, 'mensaje' => 'No se pudo realizar la búsqueda.']);
}
