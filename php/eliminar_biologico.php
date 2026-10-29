<?php
require_once 'conexion.php';
require_once 'eliminar_elemento.php';

eliminarElemento($pdo, 'biologico', 'Primero buscá el insumo que querés eliminar.', 'No se pudo eliminar el insumo.');
