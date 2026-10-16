// Direcciones de los archivos PHP que manejan los documentos
const URL_LISTAR = "../php/listar_documentos.php";
const URL_GUARDAR = "../php/guardar_documento.php";
const URL_MODIFICAR = "../php/modificar_documento.php";
const URL_ELIMINAR = "../php/eliminar_documento.php";
const URL_VER = "../php/ver_documento.php";

let documentos = [];     // la última lista de documentos que trajo el servidor
let idEnEdicion = null;  // null = documento nuevo; si tiene número, estamos editando ese documento

// Apenas carga la página, traemos los documentos guardados en la base
document.addEventListener("DOMContentLoaded", cargarDocumentos);


// Cambia los caracteres especiales por su código HTML, para que un título como
// "<b>hola</b>" se muestre como texto y no se ejecute como código
function escaparHTML(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


// Trae los documentos de la base y arma la tabla
async function cargarDocumentos() {

    const respuesta = await fetch(URL_LISTAR);
    const resultado = await respuesta.json();

    if (!resultado.exito) {
        alert(resultado.mensaje || "No se pudo cargar la lista de documentos.");
        return;
    }

    documentos = resultado.documentos;

    const tbody = document.getElementById("listaDocumentos");
    tbody.innerHTML = "";

    if (documentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay documentos cargados todavía.</td></tr>';
        return;
    }

    for (let i = 0; i < documentos.length; i++) {
        const doc = documentos[i];

        // La fecha viene como 2026-10-16: la damos vuelta para mostrarla como 16/10/2026
        const fecha = doc.fecha_creacion.split("-").reverse().join("/");

        tbody.innerHTML += `
            <tr>
                <td>${doc.id_documento}</td>
                <td>${escaparHTML(doc.tipo)}</td>
                <td>${escaparHTML(doc.nombre)}</td>
                <td>${fecha}</td>
                <td>
                    <button class="botonPequeno" onclick="verDocumento(${doc.id_documento})">👁 Ver</button>
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
    const nombre = document.getElementById("tituloDocumento").value.trim();
    const archivo = document.getElementById("archivo").files[0]; // el PDF elegido (undefined si no eligió ninguno)

    if (tipo === "" || nombre === "") {
        alert("Completá el tipo y el título del documento.");
        return;
    }

    // Un documento nuevo necesita su PDF. Al editar es opcional: si no eligen uno, se conserva el actual
    if (idEnEdicion === null && !archivo) {
        alert("Elegí el archivo PDF.");
        return;
    }

    const datos = new FormData();
    datos.append("tipo", tipo);
    datos.append("nombre", nombre);

    if (archivo) {
        datos.append("archivo", archivo);
    }

    // Si hay un ID en edición, los datos van a "modificar". Si no, van a "guardar" (documento nuevo).
    let url = URL_GUARDAR;
    if (idEnEdicion !== null) {
        datos.append("id", idEnEdicion);
        url = URL_MODIFICAR;
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


// Abre el PDF del documento en otra pestaña
function verDocumento(id) {
    window.open(URL_VER + "?id=" + id, "_blank");
}


// Pone el formulario en "modo edición" con los datos del documento elegido
function editarDocumento(id) {
    const doc = buscarDocumento(id);
    idEnEdicion = id;

    document.getElementById("tipoDocumento").value = doc.tipo;
    document.getElementById("tituloDocumento").value = doc.nombre;
    document.getElementById("archivo").value = "";
    document.getElementById("ayudaArchivo").style.display = "block";

    document.getElementById("botonSubir").textContent = "💾 Guardar Cambios";
    document.getElementById("botonCancelarEdicion").style.display = "inline-block";

    // Como la tabla está más abajo, llevamos la pantalla hasta el formulario
    document.getElementById("subir-documento").scrollIntoView({ behavior: "smooth" });
}


// Vuelve el formulario a "modo documento nuevo"
function cancelarEdicion() {
    idEnEdicion = null;

    document.getElementById("tipoDocumento").value = "";
    document.getElementById("tituloDocumento").value = "";
    document.getElementById("archivo").value = "";
    document.getElementById("ayudaArchivo").style.display = "none";

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


// Arma el código QR de un documento
function generarQR() {

    const idDocumento = document.getElementById("idDocumento").value;

    if (idDocumento == "") {
        alert("Ingrese el ID del documento.");
        return;
    }

    // Dirección del PHP que muestra el PDF. new URL(...) la completa con la dirección REAL del servidor
    // (la misma con la que abriste esta página), así el QR funciona desde otro dispositivo
    const pagina = new URL(URL_VER + "?id=" + idDocumento, location.href).href;

    // api.qrserver.com genera la imagen del QR a partir de esa dirección.
    // encodeURIComponent protege los símbolos ? y = para que no se mezclen con la dirección de la API
    const imagenQR = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(pagina);

    // El iframe muestra el código QR
    document.getElementById("qrIframe").src = imagenQR;

    // El enlace descarga esa misma imagen
    document.getElementById("descargarQR").href = imagenQR + "&download=1";
    document.getElementById("descargarQR").style.display = "inline-block";

    document.getElementById("resultadoQR").textContent = "Código QR del documento Nº " + idDocumento;

    // Si la página se abrió como "localhost", el QR diría "localhost", y para un celular eso es el propio celular
    const aviso = document.getElementById("avisoQR");

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        aviso.textContent = "Estás en localhost: este QR no abre desde un celular. Entrá a esta página con la IP de la PC " +
            "(por ejemplo http://192.168.1.10/Proyecto_Final/html/Documentacion.html) y generalo de nuevo.";
    } else {
        aviso.textContent = "";
    }
}


// Atajo de los botones "▦ QR" de cada fila: escribe el id en el campo y reutiliza generarQR()
function qrDeLaFila(idDocumento) {

    document.getElementById("idDocumento").value = idDocumento;

    generarQR();
}