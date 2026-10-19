function crearTraslado() {

    let matricula = document.getElementById('ambulancia').value;
    let hora_salida = document.getElementById('hora_salida').value;
    let hora_llegada = document.getElementById('hora_llegada').value;
    let chofer = document.getElementById('chofer').value;
    let copiloto = document.getElementById('copiloto').value;
    let id_paciente = document.getElementById('id_paciente').value;
    let id_funcionario = document.getElementById('id_funcionario').value;

    let datos = new FormData();

    datos.append('matricula', matricula);
    datos.append('hora_salida', hora_salida);
    datos.append('hora_llegada', hora_llegada);
    datos.append('chofer', chofer);
    datos.append('copiloto', copiloto);
    datos.append('id_paciente', id_paciente);
    datos.append('id_funcionario', id_funcionario);

    fetch('../php/traslado.php', {
        method: 'POST',
        body: datos
    })

    .then(respuesta => respuesta.json())
    .then(datos => {

        if (datos.exito) {

            document.getElementById('resultado').innerHTML =
                '<p>Traslado creado correctamente.</p>';

        } else {

            document.getElementById('resultado').innerHTML =
                '<p>' + datos.mensaje + '</p>';

        }

    })

    .catch(error => {
        document.getElementById('resultado').innerHTML =
            '<p>Error al crear el traslado.</p>';

    });

}

