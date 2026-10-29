<?php
// funciones_traslado.php
// Funciones que usan traslado.php (crear) y modificar_traslado.php (modificar).
// Están acá una sola vez, así no hay que copiarlas en los dos archivos.

// Los campos opcionales vacíos se guardan como NULL
function opcional($valor) {
    $valor = trim($valor ?? '');

    if ($valor === '') {
        return null;
    }
    return $valor;
}

// El input datetime-local manda "2026-10-19T14:30". La columna es DATETIME ("2026-10-19 14:30:00").
// Devuelve null si está vacío y false si lo escrito no es una fecha válida.
function fecha($valor) {
    $valor = opcional($valor);

    if ($valor === null) {
        return null;
    }

    $tiempo = strtotime($valor);

    if ($tiempo === false) {
        return false;
    }
    return date('Y-m-d H:i:s', $tiempo);
}
