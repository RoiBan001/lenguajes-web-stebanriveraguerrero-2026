-- =============================================================
-- Base de Datos: gestion_veterinaria
-- Archivo: datos_prueba.sql (DML - Datos de ejemplo)
-- =============================================================

USE gestion_veterinaria;

-- =============================================================
-- Dueños de mascotas (mínimo 3)
-- =============================================================
INSERT INTO duenos (nombre, email, telefono) VALUES
    ('Laura Martínez Gómez',   'laura.martinez@email.com',  '3001234567'),
    ('Carlos Herrera López',   'carlos.herrera@email.com',  '3119876543'),
    ('Sofía Ramírez Torres',   'sofia.ramirez@email.com',   '3205551234');

-- =============================================================
-- Mascotas (mínimo 3, asociadas a los dueños anteriores)
-- =============================================================
INSERT INTO mascotas (nombre, especie, fecha_nacimiento, id_dueno) VALUES
    ('Max',     'Perro', '2020-03-15', 1),   -- mascota de Laura
    ('Luna',    'Gato',  '2019-07-22', 1),   -- segunda mascota de Laura
    ('Perico',  'Ave',   '2021-11-05', 2),   -- mascota de Carlos
    ('Rocky',   'Perro', '2018-01-30', 3);   -- mascota de Sofía

-- =============================================================
-- Veterinarios (mínimo 2)
-- =============================================================
INSERT INTO veterinarios (nombre, especialidad, num_licencia) VALUES
    ('Dr. Andrés Castellanos', 'Medicina General Veterinaria', 'VET-COL-00123'),
    ('Dra. Valentina Cruz',    'Dermatología y Cirugía',       'VET-COL-00456');

-- =============================================================
-- Citas médicas (mínimo 3)
-- =============================================================
INSERT INTO citas (fecha_hora, id_mascota, id_veterinario, costo, diagnostico) VALUES
    ('2025-06-10 09:00:00', 1, 1, 85000.00,
        'Control de vacunación anual. Se aplicó vacuna polivalente. Paciente en buen estado general.'),
    ('2025-06-11 11:30:00', 2, 2, 120000.00,
        'Revisión dermatológica. Se detectó dermatitis alérgica leve. Se recetó antihistamínico oral por 7 días.'),
    ('2025-06-12 15:00:00', 3, 1, 60000.00,
        'Consulta general de rutina. Animal con buena plumagen y comportamiento normal. Sin novedades.');