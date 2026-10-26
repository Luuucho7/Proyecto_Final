<?php
// sesion.php
// Le responde al JavaScript si hay un funcionario logueado o no.
// Lo usan js/proteger.js (páginas del funcionario) y js/index.js (login).

session_start();

header('Content-Type: application/json');

if (isset($_SESSION['id_funcionario'])) {
    echo json_encode(['logueado' => true]);
} else {
    echo json_encode(['logueado' => false]);
}
