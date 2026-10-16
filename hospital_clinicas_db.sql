
-- Si ya existía una base con este nombre, la borra para empezar de cero
DROP DATABASE IF EXISTS hospital_clinicas;

-- Creación de la base de datos del proyecto
CREATE DATABASE hospital_clinicas;
USE hospital_clinicas;


-- Personas que pueden iniciar sesión en el sistema (guarda la cuenta, no el paciente en sí)
CREATE TABLE Persona (
    cedula INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    direccion VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE
);



-- Pacientes que administra el módulo "Pacientes"
CREATE TABLE Paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Marca qué Personas son empleados del hospital (se conecta con Persona por la cédula)
CREATE TABLE Funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    cedula INT,
    FOREIGN KEY (cedula) REFERENCES Persona(cedula)
);



-- Cada respuesta enviada en el formulario de satisfacción
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



-- Documentos informativos para pacientes: cada fila guarda sus datos y el nombre del PDF subido
CREATE TABLE Documentacion (
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    tipo VARCHAR(50),
    fecha_creacion DATE,
    archivo VARCHAR(255),
    id_funcionario INT,
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario)
);



-- Pensada para el módulo Traslados (todavía no la llena ningún formulario)
CREATE TABLE Ambulancia (
    matricula VARCHAR(20) PRIMARY KEY,
    origen VARCHAR(100),
    destino VARCHAR(100),
    acompanante VARCHAR(100)
);



-- Un traslado conecta un paciente, un funcionario y una ambulancia
CREATE TABLE Traslado (
    id_traslado INT PRIMARY KEY AUTO_INCREMENT,
    hora_salida TIME,
    hora_llegada TIME,
    chofer VARCHAR(100),
    copiloto VARCHAR(100),
    id_paciente INT,
    id_funcionario INT,
    matricula VARCHAR(20),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_funcionario) REFERENCES Funcionario(id_funcionario),
    FOREIGN KEY (matricula) REFERENCES Ambulancia(matricula)
);



-- Códigos QR generados, asociados a un paciente o a un traslado
CREATE TABLE Codigo_QR (
    id_qr INT PRIMARY KEY AUTO_INCREMENT,
    url VARCHAR(255),
    id_paciente INT,
    id_traslado INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_traslado) REFERENCES Traslado(id_traslado)
);



-- Las 3 tablas de abajo son las categorías del módulo "Elemento a trasladar"
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

ALTER TABLE Documentacion ADD COLUMN archivo VARCHAR(255) AFTER fecha_creacion;


-- Usuario de prueba para poder loguearse apenas se crea la base
-- correo: 11111111    contraseña: Admin123
INSERT INTO Persona (cedula, nombre, apellido, correo, password_hash, direccion, telefono, fecha_nacimiento)
VALUES (57730555, 'Facundo', 'Ceriotti', 'facundo231208@gmail.com',
        '$2y$10$NAVVDgl3yilSmPC14TbtGu4nDOxOIszOanriA5I8m.w7l9rElQyJu',
        'Silván Fernandez 745', '098649062', '2008-12-23');