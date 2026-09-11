// Direcciones de los 4 archivos PHP que manejan los pacientes
const URL_LISTAR = "../php/paciente_listar.php";
const URL_GUARDAR = "../php/paciente_guardar.php";
const URL_EDITAR = "../php/paciente_editar.php";
const URL_ELIMINAR = "../php/paciente_eliminar.php";

let pacientes = [];     // la última lista de pacientes que trajo el servidor
let idEnEdicion = null; // null = estamos cargando un paciente nuevo; si tiene número, estamos editando ese paciente

document.addEventListener("DOMContentLoaded", function () {
    cargarPacientes();

    // El formulario ya tiene "required" en nombre y documento, así que el navegador
    // no deja enviarlo vacío. Nosotros solo frenamos el envío normal para mandar los datos con fetch.
    const formulario = document.getElementById("formPaciente");
    formulario.addEventListener("submit", guardarPaciente);
});


// Trae los pacientes guardados en la base y arma la tabla
async function cargarPacientes() {

    const respuesta = await fetch(URL_LISTAR);
    const resultado = await respuesta.json();
    pacientes = resultado.pacientes;

    const tbody = document.getElementById("listaPacientes");
    tbody.innerHTML = "";

    for (let i = 0; i < pacientes.length; i++) {
        const p = pacientes[i];

        tbody.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.cedula}</td>
                <td>${p.telefono}</td>
                <td>${p.estado}</td>
                <td>
                    <button type="button" onclick="editarPaciente(${p.id_paciente})">Editar</button>
                    <button type="button" onclick="eliminarPaciente(${p.id_paciente})">Eliminar</button>
                </td>
            </tr>`;
    }
}


// Se ejecuta al enviar el formulario (botón "Guardar Paciente" / "Guardar Cambios")
async function guardarPaciente(evento) {
    evento.preventDefault(); // frenamos el envío normal, los datos los mandamos nosotros con fetch

    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("documento").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const estado = document.getElementById("estado").value;

    const datos = new FormData();
    datos.append("nombre", nombre);
    datos.append("cedula", cedula);
    datos.append("telefono", telefono);
    datos.append("estado", estado);

    // Si hay un ID en edición, los datos van a "editar". Si no, van a "guardar" (paciente nuevo).
    let url = URL_GUARDAR;
    if (idEnEdicion !== null) {
        datos.append("id", idEnEdicion);
        url = URL_EDITAR;
    }

    const respuesta = await fetch(url, { method: "POST", body: datos });
    const resultado = await respuesta.json();

    if (resultado.exito) {
        cancelarEdicion();
        cargarPacientes();
    } else {
        alert(resultado.mensaje || "No se pudo guardar el paciente.");
    }
}


// Busca en la lista ya cargada el paciente con ese id
function buscarPaciente(id) {
    for (let i = 0; i < pacientes.length; i++) {
        if (pacientes[i].id_paciente == id) {
            return pacientes[i];
        }
    }
}


// Pone el formulario en "modo edición" con los datos del paciente elegido
function editarPaciente(id) {
    const p = buscarPaciente(id);
    idEnEdicion = id;

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("documento").value = p.cedula;
    document.getElementById("telefono").value = p.telefono;
    document.getElementById("estado").value = p.estado;

    document.getElementById("botonGuardar").textContent = "Guardar Cambios";
    document.getElementById("botonCancelarEdicion").style.display = "inline-block";
}


// Vuelve el formulario a "modo paciente nuevo"
function cancelarEdicion() {
    idEnEdicion = null;

    document.getElementById("formPaciente").reset();
    document.getElementById("botonGuardar").textContent = "Guardar Paciente";
    document.getElementById("botonCancelarEdicion").style.display = "none";
}


// Borra un paciente (pide confirmación antes de hacerlo)
async function eliminarPaciente(id) {
    if (!confirm("¿Seguro que querés eliminar este paciente?")) return;

    const datos = new FormData();
    datos.append("id", id);

    const respuesta = await fetch(URL_ELIMINAR, { method: "POST", body: datos });
    const resultado = await respuesta.json();

    if (resultado.exito) {
        cargarPacientes();
    } else {
        alert(resultado.mensaje || "No se pudo eliminar el paciente.");
    }
}