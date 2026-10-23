
DROP DATABASE IF EXISTS hospital_clinicas_db;

CREATE DATABASE hospital_clinicas_db;
USE hospital_clinicas_db;



CREATE TABLE Persona (
    cedula INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    direccion VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE
)



CREATE TABLE Paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    cedula INT,
    FOREIGN KEY (cedula) REFERENCES Persona(cedula)
);



CREATE TABLE Encuesta (
    id_encuesta INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    edad INT,
    servicio VARCHAR(50),
    atencion VARCHAR(20),
    amabilidad VARCHAR(5),
    informacion VARCHAR(5),
    instalaciones INT,
    recomendacion VARCHAR(5),
    comentarios TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Documentacion (
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    tipo VARCHAR(50),
    archivo VARCHAR(255),        -- nombre del PDF dentro de la carpeta documentos/
    fecha_creacion DATE,
    id_funcionario INT,
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario)
);



CREATE TABLE Ambulancia (
    matricula VARCHAR(20) PRIMARY KEY,
    origen VARCHAR(100),
    destino VARCHAR(100),
    acompanante VARCHAR(100)
);



CREATE TABLE Traslado (
    id_traslado INT PRIMARY KEY AUTO_INCREMENT,
    hora_salida TIME,
    hora_llegada TIME,
    chofer VARCHAR(100),
    copiloto VARCHAR(100),
    id_paciente INT,
    id_funcionario INT,
    matricula VARCHAR(20),
    tipo_elemento VARCHAR(20),   -- biologico / no_biologico / organo
    id_elemento INT,             -- id en la tabla de ese tipo
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario),
    FOREIGN KEY (matricula) REFERENCES Ambulancia(matricula)
);



CREATE TABLE Codigo_QR (
    id_qr INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(255),
    id_paciente INT,
    id_traslado INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_traslado) REFERENCES Traslado(id_traslado)
);



CREATE TABLE biologico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    estado VARCHAR(50)
);



CREATE TABLE no_biologico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clasificacion VARCHAR(100),
    pendiente VARCHAR(100)
);



CREATE TABLE organo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona VARCHAR(100),
    en_curso VARCHAR(100)
);



-- correo: 11111111    contraseña: Admin123
INSERT INTO Persona (cedula, nombre, apellido, correo, password_hash, direccion, telefono, fecha_nacimiento)
VALUES (57730555, 'Facundo', 'Ceriotti', 'facundo231208@gmail.com',
        '$2y$10$NAVVDgl3yilSmPC14TbtGu4nDOxOIszOanriA5I8m.w7l9rElQyJu',
        'Silván Fernandez 745', '098649062', '2008-12-23');


-- Las ambulancias que aparecen en el selector de Traslado.html
INSERT INTO Ambulancia (matricula) VALUES ('SBA 3355'), ('IAE 2466'), ('IAH 1234');


-- El usuario de prueba también es funcionario (id_funcionario = 1)
INSERT INTO Funcionario (cedula) VALUES (57730555);


-- Los documentos que pide la letra. Los PDF están en la carpeta documentos/
-- El paciente los abre desde el QR: php/ver_documento.php?id=1, ?id=2, ...
INSERT INTO Documentacion (nombre, tipo, archivo, fecha_creacion, id_funcionario) VALUES
('Indicaciones de interrupción voluntaria del embarazo', 'Indicaciones', 'interrupcion_voluntaria_embarazo.pdf', CURDATE(), 1),
('Prostatectomía radical: indicaciones e información para el paciente', 'Indicaciones', 'prostatectomia_radical.pdf', CURDATE(), 1),
('Preparación para estudios imagenológicos', 'Preparación para estudios', 'estudios_imagenologicos.pdf', CURDATE(), 1),
('Estudios diagnósticos con pertecneciato', 'Preparación para estudios', 'estudios_pertecneciato.pdf', CURDATE(), 1),
('Centellograma de perfusión miocárdica', 'Preparación para estudios', 'centellograma_perfusion_miocardica.pdf', CURDATE(), 1),
('Indicaciones ecocardiograma con dobutamina', 'Indicaciones', 'ecocardiograma_dobutamina.pdf', CURDATE(), 1),
('Indicaciones para pacientes en tratamiento con warfarina', 'Indicaciones', 'tratamiento_warfarina.pdf', CURDATE(), 1),
('Indicaciones ecocardiograma transesofágico', 'Indicaciones', 'ecocardiograma_transesofagico.pdf', CURDATE(), 1),
('Indicaciones para ingreso a centro de nefrología y trasplante', 'Indicaciones', 'ingreso_nefrologia_trasplante.pdf', CURDATE(), 1),
('Plan de alta enfermería, Nefrología', 'Enfermería', 'plan_alta_nefrologia.pdf', CURDATE(), 1),
('Indicaciones de enfermería para usuarios trasplantados', 'Enfermería', 'enfermeria_trasplantados.pdf', CURDATE(), 1),
('Prevención de infecciones', 'Prevención', 'prevencion_infecciones.pdf', CURDATE(), 1),
('Encuesta de satisfacción del usuario trasplantado', 'Encuesta', 'encuesta_usuario_trasplantado.pdf', CURDATE(), 1),
('Pauta para pacientes ostomizados', 'Indicaciones', 'pauta_ostomizados.pdf', CURDATE(), 1);
