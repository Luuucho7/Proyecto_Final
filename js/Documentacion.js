function subirDocumento() {

    let paciente = document.getElementById("paciente").value;
    let tipoDocumento = document.getElementById("tipoDocumento").value;
    let archivo = document.getElementById("archivo").value;

    if (paciente == "" || tipoDocumento == "" || archivo == "") {

        alert("Complete todos los campos antes de subir el documento.");

    } else {

        alert("El documento fue cargado correctamente.");
    }
}


function generarQR() {

    let idDocumento = document.getElementById("idDocumento").value;

    if (idDocumento == "") {

        alert("Ingrese el ID del documento.");

    } else {

        document.getElementById("resultadoQR").innerHTML =
            "Código QR generado para el documento Nº " + idDocumento;
    }
}