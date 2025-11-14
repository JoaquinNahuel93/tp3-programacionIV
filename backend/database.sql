-- ===========================================================
--  BASE DE DATOS: gestion_alumnos
--  Autor: Joaquin Nahuel González
--  Descripción: Sistema de gestión de alumnos, materias y notas
-- ===========================================================

CREATE DATABASE IF NOT EXISTS gestion_alumnos
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE gestion_alumnos;

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_usuario_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alumno (
  id_alumno INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  UNIQUE KEY uq_alumno_dni (dni)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS materia (
  id_materia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  anio INT NOT NULL,
  UNIQUE KEY uq_materia_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS nota (
  id_nota INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT UNSIGNED NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  nota1 DECIMAL(4,2) DEFAULT NULL,
  nota2 DECIMAL(4,2) DEFAULT NULL,
  nota3 DECIMAL(4,2) DEFAULT NULL,
  CONSTRAINT fk_nota_alumno
    FOREIGN KEY (alumno_id) REFERENCES alumno(id_alumno)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nota_materia
    FOREIGN KEY (materia_id) REFERENCES materia(id_materia)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_nota_alumno_materia UNIQUE (alumno_id, materia_id),
  CONSTRAINT ck_nota1 CHECK (nota1 IS NULL OR (nota1 >= 0 AND nota1 <= 10)),
  CONSTRAINT ck_nota2 CHECK (nota2 IS NULL OR (nota2 >= 0 AND nota2 <= 10)),
  CONSTRAINT ck_nota3 CHECK (nota3 IS NULL OR (nota3 >= 0 AND nota3 <= 10))
) ENGINE=InnoDB;
