CREATE DATABASE hospital_clinicas;

USE hospital_clinicas;

CREATE TABLE Persona (
    cedula INT PRIMARY KEY,
    nombre VARCHAR(100),
    edad INT,
    direccion VARCHAR(100),
    telefono VARCHAR(20)
);

CREATE TABLE Paciente (
    
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    cedula INT,
    FOREIGN KEY (cedula) REFERENCES Persona(cedula)
);

CREATE TABLE Documentacion (
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    tipo VARCHAR(50),
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
