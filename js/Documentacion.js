function subirDocumento() {

    let tipoDocumento = document.getElementById("tipoDocumento").value;
    let descripcion = document.getElementById("descripcionDocumento").value;
    let archivo = document.getElementById("archivo").value;

    if (tipoDocumento == "" || descripcion == "" || archivo == "") {

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

        let pagina = "http://localhost/Proyecto_Final/html/Documentacion.html?documento=" + idDocumento;

        let imagenQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + pagina;

        document.getElementById("qrIframe").src = imagenQR;

        document.getElementById("descargarQR").href = imagenQR + "&download=1";
        document.getElementById("descargarQR").style.display = "inline-block";

        document.getElementById("resultadoQR").innerHTML =
            "Código QR del documento Nº " + idDocumento;
    }
}

function qrDeLaFila(idDocumento) {

    document.getElementById("idDocumento").value = idDocumento;

    generarQR();
}
