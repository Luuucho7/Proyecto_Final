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

        // La dirección se arma con la misma que tiene el navegador ahora.
        // Si abrís esta página con la IP de la PC (ej: http://192.168.1.50/Proyecto_Final/...),
        // el QR también va a usar esa IP, y así el celular del paciente la puede abrir.
        let servidor = window.location.origin;
        let carpeta = window.location.pathname.split("/html/")[0];

        // El QR lleva a la página pública del documento (la que ve el paciente)
        let pagina = servidor + carpeta + "/php/ver_documento.php?id=" + idDocumento;

        // encodeURIComponent hace que el "?" y el "=" de la dirección no se confundan con los del servicio de QR
        let imagenQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(pagina);

        document.getElementById("qrImagen").src = imagenQR;
        document.getElementById("qrImagen").style.display = "block";

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
