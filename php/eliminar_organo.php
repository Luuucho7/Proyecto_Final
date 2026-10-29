<?php
// eliminar_organo.php
// Borra un elemento de la tabla organo JUNTO CON su traslado (el código está en eliminar_elemento.php)
require_once 'conexion.php';
require_once 'eliminar_elemento.php';

eliminarElemento($pdo, 'organo', 'Primero buscá el registro que querés eliminar.', 'No se pudo eliminar el registro.');
