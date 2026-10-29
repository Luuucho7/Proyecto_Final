<?php

function opcional($valor) {
    $valor = trim($valor ?? '');

    if ($valor === '') {
        return null;
    }
    return $valor;
}

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
