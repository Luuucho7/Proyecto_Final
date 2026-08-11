<?php

include "../php/conexion.php";

$busqueda = "";

if (isset($_GET["buscar"])) {
    $busqueda = $_GET["buscar"];
}

$sql = "SELECT * FROM pacientes
        WHERE ci LIKE ?
        OR nombre LIKE ?
        OR apellido LIKE ?
        ORDER BY id DESC";

$stmt = $conn->prepare($sql);

$buscar = "%" . $busqueda . "%";

$stmt->bind_param("sss", $buscar, $buscar, $buscar);

$stmt->execute();

$resultado = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Pacientes - Hospital de Clínicas</title>

    <link rel="stylesheet" href="../css/style.css">

</head>

<body>

    <!-- Flecha para volver -->
    <a href="../html/pagina_principal.html" class="flecha">
        <img src="../css/img/flechaizquierda.jpg" alt="Volver">
    </a>


    <!-- CONTENIDO PRINCIPAL -->

    <main class="pacientes">

        <div class="titulo-pacientes">

            <div>
                <h1>Pacientes</h1>

                <p class="subtitulo">
                    Lista de pacientes registrados
                </p>
            </div>


            <!-- BOTÓN NUEVO PACIENTE -->

            <a href="#formularioPaciente" class="boton-nuevo">
                + Nuevo paciente
            </a>

        </div>


        <!-- BUSCADOR -->

        <form method="GET" class="buscador">

            <input
                type="text"
                name="buscar"
                placeholder="Buscar paciente..."
                value="<?php echo htmlspecialchars($busqueda); ?>"
            >

            <button type="submit">
                🔍
            </button>

        </form>


        <!-- TABLA -->

        <div class="tabla-contenedor">

            <table class="tabla-pacientes">

                <thead>

                    <tr>

                        <th>CI</th>

                        <th>Nombre</th>

                        <th>Apellido</th>

                        <th>Fecha de nacimiento</th>

                        <th>Teléfono</th>

                        <th>Estado</th>

                    </tr>

                </thead>


                <tbody>

                <?php

                if ($resultado->num_rows > 0) {

                    while ($paciente = $resultado->fetch_assoc()) {

                ?>

                    <tr>

                        <td>
                            <?php echo htmlspecialchars($paciente["ci"]); ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($paciente["nombre"]); ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($paciente["apellido"]); ?>
                        </td>

                        <td>
                            <?php
                            echo date(
                                "d/m/Y",
                                strtotime($paciente["fecha_nacimiento"])
                            );
                            ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($paciente["telefono"]); ?>
                        </td>

                        <td>

                            <?php if ($paciente["estado"] == "Activo") { ?>

                                <span class="estado activo">
                                    Activo
                                </span>

                            <?php } else { ?>

                                <span class="estado inactivo">
                                    Inactivo
                                </span>

                            <?php } ?>

                        </td>

                    </tr>

                <?php

                    }

                } else {

                ?>

                    <tr>

                        <td colspan="6" class="sin-pacientes">
                            No se encontraron pacientes.
                        </td>

                    </tr>

                <?php

                }

                ?>

                </tbody>

            </table>

        </div>


        <!-- FORMULARIO NUEVO PACIENTE -->

        <div id="formularioPaciente" class="formulario-paciente">

            <h2>Nuevo paciente</h2>

            <form action="../php/guardar_paciente.php" method="POST">

                <label>CI</label>

                <input
                    type="text"
                    name="ci"
                    placeholder="Ej: 4.567.890-1"
                    required
                >


                <label>Nombre</label>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    required
                >


                <label>Apellido</label>

                <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    required
                >


                <label>Fecha de nacimiento</label>

                <input
                    type="date"
                    name="fecha_nacimiento"
                    required
                >


                <label>Teléfono</label>

                <input
                    type="text"
                    name="telefono"
                    placeholder="Ej: 099123456"
                >


                <label>Estado</label>

                <select name="estado">

                    <option value="Activo">
                        Activo
                    </option>

                    <option value="Inactivo">
                        Inactivo
                    </option>

                </select>


                <button type="submit" class="boton-guardar">
                    Guardar paciente
                </button>

            </form>

        </div>

    </main>

</body>

</html>