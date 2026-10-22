// ---------- MOSTRAR LOS DOCUMENTOS EN LA TABLA ----------

async function cargarDocumentos() {

    // Le pedimos al servidor la lista de documentos de la base
    let respuesta = await fetch("../php/listar_documentos.php");
    let resultado = await respuesta.json();

    let filas = "";

    // Recorremos los documentos de uno en uno y vamos armando una fila por cada uno
    for (let i = 0; i < resultado.documentos.length; i++) {

        let doc = resultado.documentos[i];

        // La fecha viene como 2026-10-22; la damos vuelta a 22/10/2026
        let partes = doc.fecha_creacion.split("-");
        let fecha = partes[2] + "/" + partes[1] + "/" + partes[0];

        filas = filas + "<tr>" +
            "<td>" + doc.id_documento + "</td>" +
            "<td>" + doc.tipo + "</td>" +
            "<td>" + doc.nombre + "</td>" +
            "<td>" + fecha + "</td>" +
            "<td>" +
                // "Ver" es un enlace común al PDF: se abre en otra pestaña
                "<a class='botonPequeno' href='../documentos/" + doc.archivo + "' target='_blank'>👁 Ver</a> " +
                // "QR" llama a la función de más abajo con el id de esta fila
                "<button class='botonPequeno' onclick='qrDeLaFila(" + doc.id_documento + ")'>▦ QR</button> " +
                // "Eliminar" llama a eliminarDocumento con el id de esta fila
                "<button class='botonPequeno' onclick='eliminarDocumento(" + doc.id_documento + ")'>🗑 Eliminar</button>" +
            "</td>" +
            "</tr>";
    }

    // Ponemos todas las filas juntas dentro de la tabla
    document.getElementById("tablaDocumentos").innerHTML = filas;
}


// ---------- SUBIR UN DOCUMENTO ----------

async function subirDocumento() {

    let tipoDocumento = document.getElementById("tipoDocumento").value;
    let nombre = document.getElementById("nombreDocumento").value;
    let archivo = document.getElementById("archivo").files[0];

    if (tipoDocumento == "" || nombre == "" || !archivo) {

        alert("Complete todos los campos antes de subir el documento.");

    } else {

        // FormData sirve para mandar texto y archivo juntos al PHP
        let datos = new FormData();
        datos.append("tipo", tipoDocumento);
        datos.append("nombre", nombre);
        datos.append("archivo", archivo);

        let respuesta = await fetch("../php/guardar_documento.php", {
            method: "POST",
            body: datos
        });
        let resultado = await respuesta.json();

        if (resultado.exito) {

            alert("El documento fue cargado correctamente.");

            // Limpiamos el formulario y volvemos a mostrar la tabla con el documento nuevo
            document.getElementById("tipoDocumento").value = "";
            document.getElementById("nombreDocumento").value = "";
            document.getElementById("archivo").value = "";
            cargarDocumentos();

        } else {

            // El PHP dice qué falló (no es PDF, pesa mucho, etc.)
            alert(resultado.mensaje);
        }
    }
}


// ---------- ELIMINAR UN DOCUMENTO ----------

async function eliminarDocumento(idDocumento) {

    // confirm() muestra "Aceptar / Cancelar". Si apretan Cancelar, no se borra nada
    let seguro = confirm("¿Seguro que querés eliminar el documento Nº " + idDocumento + "? También se borra su PDF y su QR deja de funcionar.");

    if (seguro) {

        // Le mandamos al PHP el id del documento a borrar
        let datos = new FormData();
        datos.append("id", idDocumento);

        let respuesta = await fetch("../php/eliminar_documento.php", {
            method: "POST",
            body: datos
        });
        let resultado = await respuesta.json();

        if (resultado.exito) {

            // Volvemos a mostrar la tabla, ya sin el documento borrado
            cargarDocumentos();

        } else {

            alert(resultado.mensaje);
        }
    }
}


// ---------- CÓDIGO QR ----------

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


// Apenas se abre la página, mostramos la tabla
cargarDocumentos();