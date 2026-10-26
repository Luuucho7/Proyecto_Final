<?php
// verificar_sesion.php
// Se incluye al principio de cada PHP que solo puede usar un funcionario.
// Si no hay un funcionario logueado, corta acá y no deja seguir.

session_start();

if (!isset($_SESSION['id_funcionario'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['exito' => false, 'mensaje' => 'Tenés que iniciar sesión como funcionario.']);
    exit();
}
