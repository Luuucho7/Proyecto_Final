<?php
require_once 'conexion.php';
require_once 'eliminar_elemento.php';

eliminarElemento($pdo, 'organo', 'Primero buscá el registro que querés eliminar.', 'No se pudo eliminar el registro.');
