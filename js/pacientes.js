document.addEventListener("DOMContentLoaded", function() {

    const boton = document.getElementById("btn-guardar");
    const tabla = document.querySelector(".tabla-pacientes tbody");
    const formulario = document.getElementById("form-paciente");

    if (boton) {
        boton.addEventListener("click", function() {

            // Capturamos lo que escribió el usuario
            const nombre = document.getElementById("nombre").value;
            const cedula = document.getElementById("cedula").value;
            const telefono = document.getElementById("telefono").value;
            const estado = document.getElementById("estado").value;

            // Validamos que no envíe campos vacíos
            if (nombre === "" || cedula === "") {
                alert("Completa el nombre y la cédula");
                return;
            }

            // Armamos el objeto con los datos
            const paciente = {
                nombre: nombre,
                cedula: cedula,
                telefono: telefono,
                estado: estado
            };

            // Enviamos los datos al archivo PHP (ajusta la ruta si guardaste el PHP en otra carpeta)
            fetch("../php/guardar.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paciente)
            })
            .then(respuesta => respuesta.json())
            .then(resultado => {
                if (resultado === "ok") {
                    alert("¡Paciente guardado en la base de datos!");

                    // Creamos la nueva fila para mostrarla en la tabla
                    let claseEstado = (estado === "inactivo") ? "estado-inactivo" : "estado-activo";
                    const nuevaFila = `
                        <tr>
                            <td>${nombre}</td>
                            <td>${cedula}</td>
                            <td>${telefono}</td>
                            <td><span class="estado ${claseEstado}">${estado}</span></td>
                        </tr>
                    `;

                    // Insertamos la fila en la tabla y limpiamos los campos
                    tabla.innerHTML += nuevaFila;
                    formulario.reset();
                } else {
                    alert("Error: No se pudo guardar en la base de datos.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Ocurrió un error. Verifica que Apache y MySQL estén encendidos en XAMPP.");
            });
        });
    }
});