<?php
// logout.php
// Cierra la sesión del funcionario y lo lleva a la página principal pública.

session_start();

$_SESSION = [];
session_destroy();

header('Location: ../html/pagina_principal.html');
exit();
