-- =============================================================
-- Base de Datos: gestion_veterinaria
-- Sistema de Citas Médicas - Veterinaria Huellitas Felices
-- Archivo: estructura.sql (DDL)
-- =============================================================

-- Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS gestion_veterinaria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_veterinaria;

-- =============================================================
-- TABLA: duenos
-- Registra los clientes (dueños de mascotas)
-- =============================================================
CREATE TABLE duenos (
    id_dueno     INT            NOT NULL AUTO_INCREMENT,
    nombre       VARCHAR(150)   NOT NULL,
    email        VARCHAR(254)   NOT NULL,
    telefono     VARCHAR(20)    NOT NULL,

    CONSTRAINT pk_duenos   PRIMARY KEY (id_dueno),
    CONSTRAINT uq_duenos_email UNIQUE (email)
);

-- =============================================================
-- TABLA: mascotas
-- Registra cada mascota asociada a un dueño
-- =============================================================
CREATE TABLE mascotas (
    id_mascota        INT          NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    especie           VARCHAR(50)  NOT NULL,
    fecha_nacimiento  DATE         NOT NULL,
    id_dueno          INT          NOT NULL,

    CONSTRAINT pk_mascotas          PRIMARY KEY (id_mascota),
    CONSTRAINT fk_mascotas_dueno    FOREIGN KEY (id_dueno)
        REFERENCES duenos (id_dueno)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- =============================================================
-- TABLA: veterinarios
-- Registra los profesionales de la clínica
-- =============================================================
CREATE TABLE veterinarios (
    id_veterinario    INT           NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(150)  NOT NULL,
    especialidad      VARCHAR(100)  NOT NULL,
    num_licencia      VARCHAR(50)   NOT NULL,

    CONSTRAINT pk_veterinarios          PRIMARY KEY (id_veterinario),
    CONSTRAINT uq_veterinarios_licencia UNIQUE (num_licencia)
);

-- =============================================================
-- TABLA: citas
-- Registra las consultas/citas médicas programadas
-- =============================================================
CREATE TABLE citas (
    id_cita          INT             NOT NULL AUTO_INCREMENT,
    fecha_hora       DATETIME        NOT NULL,
    id_mascota       INT             NOT NULL,
    id_veterinario   INT             NOT NULL,
    costo            DECIMAL(10, 2)  NOT NULL,
    diagnostico      TEXT,

    CONSTRAINT pk_citas                  PRIMARY KEY (id_cita),
    CONSTRAINT fk_citas_mascota          FOREIGN KEY (id_mascota)
        REFERENCES mascotas (id_mascota)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_citas_veterinario      FOREIGN KEY (id_veterinario)
        REFERENCES veterinarios (id_veterinario)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_citas_costo_positivo  CHECK (costo >= 0)
);