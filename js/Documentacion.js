// Direcciones de los 4 archivos PHP que manejan los documentos
const URL_LISTAR = "../php/documentacion_listar.php";
const URL_GUARDAR = "../php/documentacion_guardar.php";
const URL_EDITAR = "../php/documentacion_editar.php";
const URL_ELIMINAR = "../php/documentacion_eliminar.php";

let documentos = [];      // la última lista de documentos que trajo el servidor
let idEnEdicion = null;   // null = estamos cargando un documento nuevo; si tiene número, estamos editando ese documento

document.addEventListener("DOMContentLoaded", cargarDocumentos);


// Trae los documentos guardados en la base y arma la tabla
async function cargarDocumentos() {

    const respuesta = await fetch(URL_LISTAR);
    const resultado = await respuesta.json();
    documentos = resultado.documentos;

    const tbody = document.getElementById("listaDocumentos");
    tbody.innerHTML = "";

    for (let i = 0; i < documentos.length; i++) {
        const doc = documentos[i];

        tbody.innerHTML += `
            <tr>
                <td>${doc.id_documento}</td>
                <td>${doc.tipo}</td>
                <td>${doc.nombre}</td>
                <td>${doc.fecha_creacion}</td>
                <td>
                    <button class="botonPequeno" onclick="editarDocumento(${doc.id_documento})">✏ Editar</button>
                    <button class="botonPequeno" onclick="eliminarDocumento(${doc.id_documento})">🗑 Eliminar</button>
                    <button class="botonPequeno" onclick="qrDeLaFila(${doc.id_documento})">▦ QR</button>
                </td>
            </tr>`;
    }
}


// Se ejecuta al tocar el botón (que dice "Subir Documento" o "Guardar Cambios", según el modo)
async function subirDocumento() {

    const tipo = document.getElementById("tipoDocumento").value;
    const nombre = document.getElementById("descripcionDocumento").value.trim();

    if (tipo === "" || nombre === "") {
        alert("Complete el tipo y la descripción.");
        return;
    }

    const datos = new FormData();
    datos.append("tipo", tipo);
    datos.append("nombre", nombre);

    // Si hay un ID en edición, los datos van a "editar". Si no, van a "guardar" (documento nuevo).
    let url = URL_GUARDAR;
    if (idEnEdicion !== null) {
        datos.append("id", idEnEdicion);
        url = URL_EDITAR;
    }

    const respuesta = await fetch(url, { method: "POST", body: datos });
    const resultado = await respuesta.json();

    if (resultado.exito) {
        cancelarEdicion();
        cargarDocumentos();
    } else {
        alert(resultado.mensaje || "No se pudo guardar el documento.");
    }
}


// Busca en la lista ya cargada el documento con ese id
function buscarDocumento(id) {
    for (let i = 0; i < documentos.length; i++) {
        if (documentos[i].id_documento == id) {
            return documentos[i];
        }
    }
}


// Pone el formulario en "modo edición" con los datos del documento elegido
function editarDocumento(id) {
    const doc = buscarDocumento(id);
    idEnEdicion = id;

    document.getElementById("tipoDocumento").value = doc.tipo;
    document.getElementById("descripcionDocumento").value = doc.nombre;
    document.getElementById("botonSubir").textContent = "💾 Guardar Cambios";
    document.getElementById("botonCancelarEdicion").style.display = "inline-block";
}


// Vuelve el formulario a "modo documento nuevo"
function cancelarEdicion() {
    idEnEdicion = null;

    document.getElementById("tipoDocumento").value = "";
    document.getElementById("descripcionDocumento").value = "";
    document.getElementById("botonSubir").textContent = "⬆ Subir Documento";
    document.getElementById("botonCancelarEdicion").style.display = "none";
}


// Borra un documento (pide confirmación antes de hacerlo)
async function eliminarDocumento(id) {
    if (!confirm("¿Seguro que querés eliminar este documento?")) return;

    const datos = new FormData();
    datos.append("id", id);

    const respuesta = await fetch(URL_ELIMINAR, { method: "POST", body: datos });
    const resultado = await respuesta.json();

    if (resultado.exito) {
        cargarDocumentos();
    } else {
        alert(resultado.mensaje || "No se pudo eliminar el documento.");
    }
}


// --- Estas dos funciones ya estaban antes, no se tocaron ---

function generarQR() {

    let idDocumento = document.getElementById("idDocumento").value;

    if (idDocumento == "") {

        alert("Ingrese el ID del documento.");

    } else {

        // Dirección de la página de ese documento.
        let pagina = "http://localhost/Proyecto_Final/html/Documentacion.html?documento=" + idDocumento;

        // Dirección de la imagen del código QR de esa página.
        let imagenQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + pagina;

        // El iframe muestra el código QR.
        document.getElementById("qrIframe").src = imagenQR;

        // El enlace descarga esa misma imagen.
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
