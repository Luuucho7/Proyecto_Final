

function formatoFecha(fecha) {
    if (!fecha) {
        return "—";
    }

    const partes = fecha.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function filaMensaje(tabla, mensaje) {
    tabla.innerHTML = "";

    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.textContent = mensaje;

    fila.appendChild(celda);
    tabla.appendChild(fila);
}

async function cargarDocumentos() {
    const tabla = document.getElementById("tablaDocumentos");

    try {
        const respuesta = await fetch("../php/listar_documentos.php");
        const resultado = await respuesta.json();

        if (!resultado.exito) {
            filaMensaje(tabla, t(resultado.mensaje));
            return;
        }

        if (resultado.documentos.length === 0) {
            filaMensaje(tabla, t("No hay documentos cargados todavía."));
            return;
        }

        tabla.innerHTML = "";

        resultado.documentos.forEach(function (documento) {
            const fila = document.createElement("tr");

            const datos = [
                documento.id_documento,
                documento.tipo,
                documento.nombre,
                formatoFecha(documento.fecha_creacion)
            ];

            datos.forEach(function (dato) {
                const celda = document.createElement("td");
                celda.textContent = dato;
                fila.appendChild(celda);
            });

            const acciones = document.createElement("td");

            const botonVer = document.createElement("button");
            botonVer.className = "botonPequeno";
            botonVer.textContent = "👁 " + t("Ver");
            botonVer.addEventListener("click", function () {
                window.open("../php/ver_documento.php?id=" + documento.id_documento, "_blank");
            });

            const botonQR = document.createElement("button");
            botonQR.className = "botonPequeno";
            botonQR.textContent = "▦ QR";
            botonQR.addEventListener("click", function () {
                qrDeLaFila(documento.id_documento);
            });

            acciones.appendChild(botonVer);
            acciones.appendChild(botonQR);
            fila.appendChild(acciones);

            tabla.appendChild(fila);
        });

    } catch (error) {
        filaMensaje(tabla, t("No se pudo obtener la lista de documentos."));
    }
}

document.addEventListener("DOMContentLoaded", cargarDocumentos);



async function subirDocumento() {

    let tipoDocumento = document.getElementById("tipoDocumento").value;
    let descripcion = document.getElementById("descripcionDocumento").value.trim();
    let campoArchivo = document.getElementById("archivo");
    let botonSubir = document.getElementById("botonSubir");

    if (tipoDocumento == "" || descripcion == "" || campoArchivo.files.length === 0) {
        alert(t("Complete todos los campos antes de subir el documento."));
        return;
    }

    const datos = new FormData();
    datos.append("tipo", tipoDocumento);
    datos.append("descripcion", descripcion);
    datos.append("archivo", campoArchivo.files[0]);

    botonSubir.disabled = true;

    try {
        const respuesta = await fetch("../php/subir_documento.php", {
            method: "POST",
            body: datos
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(t("El documento fue cargado correctamente.") + " ID: " + resultado.id_documento);

            document.getElementById("tipoDocumento").value = "";
            document.getElementById("descripcionDocumento").value = "";
            campoArchivo.value = "";
            cargarDocumentos();
        } else {
            alert(t(resultado.mensaje));
        }

    } catch (error) {
        alert(t("No se pudo subir el documento."));
    }

    botonSubir.disabled = false;
}



function generarQR() {

    let idDocumento = document.getElementById("idDocumento").value;

    if (idDocumento == "") {

        alert(t("Ingrese el ID del documento."));

    } else {

        let servidor = window.location.origin;
        let carpeta = window.location.pathname.split("/html/")[0];

        let pagina = servidor + carpeta + "/php/ver_documento.php?id=" + idDocumento;

        let imagenQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(pagina);

        const qrImagen = document.getElementById("qrImagen");
        qrImagen.src = imagenQR;
        qrImagen.style.display = "block";

        const descargarQR = document.getElementById("descargarQR");
        descargarQR.href = imagenQR + "&download=1";
        descargarQR.style.display = "inline-block";

        document.getElementById("resultadoQR").innerHTML =
            t("Código QR del documento Nº") + " " + idDocumento;
    }
}

function qrDeLaFila(idDocumento) {

    document.getElementById("idDocumento").value = idDocumento;

    generarQR();
}
