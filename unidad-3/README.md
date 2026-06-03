# Actividad 1 – Modelado y Creación de la Capa de Persistencia
### Sistema de Citas Médicas – Veterinaria Huellitas Felices

---

## Estructura del Proyecto

```
actividad-1/
├── diagramas/
│   ├── modelo_conceptual.png
│   └── modelo_logico.png
├── sql/
│   ├── estructura.sql
│   └── datos_prueba.sql
└── README.md
```

---

## Justificaciones Técnicas

### 1. Tipos de Datos Seleccionados

| Columna | Tipo elegido | Justificación |
|---|---|---|
| `id_*` (PKs) | `INT AUTO_INCREMENT` | Genera identificadores numéricos únicos y crecientes de forma automática, sin depender de lógica de aplicación. El tipo `INT` soporta hasta ~2 100 millones de registros, suficiente para el contexto de una clínica. |
| `nombre`, `especialidad` | `VARCHAR(n)` | Almacenamiento de longitud variable; sólo consume el espacio real utilizado. Los límites (150, 100 caracteres) son representativos de nombres reales sin desperdiciar espacio. |
| `email` | `VARCHAR(254)` | El estándar RFC 5321 establece 254 como la longitud máxima válida de una dirección de correo electrónico. |
| `num_licencia` | `VARCHAR(50)` | Las licencias profesionales pueden incluir letras, guiones y números (p. ej. `VET-COL-00123`); un tipo numérico puro sería incorrecto. |
| `fecha_nacimiento` | `DATE` | Almacena sólo la fecha (AAAA-MM-DD), ya que la hora de nacimiento no es relevante para el negocio. Ocupa 3 bytes, más eficiente que `DATETIME`. |
| `fecha_hora` (citas) | `DATETIME` | Registra fecha **y** hora exacta de la cita, lo cual es indispensable para la programación de turnos médicos. |
| `costo` | `DECIMAL(10, 2)` | Tipo de precisión exacta (no flotante). Garantiza que los valores monetarios se representen sin errores de redondeo binario. La escala de 2 decimales es suficiente para pesos colombianos. |
| `diagnostico` | `TEXT` | Campo de longitud ilimitada (hasta 65 535 bytes) para alojar observaciones médicas extensas sin truncamiento. Se permite `NULL` porque una cita puede registrarse antes de realizarse. |
| `telefono` | `VARCHAR(20)` | El teléfono se almacena como cadena para preservar ceros iniciales, extensiones y formatos internacionales (p. ej. `+57 300 123 4567`). |
| `especie` | `VARCHAR(50)` | Se usa texto libre en lugar de un `ENUM` para no limitar las especies registrables a medida que crece el negocio. |

---

### 2. Políticas de Integridad Referencial

Se definieron las siguientes relaciones con sus políticas `ON DELETE` y `ON UPDATE`:

#### `mascotas → duenos` (`fk_mascotas_dueno`)

| Evento | Política | Razón |
|---|---|---|
| `ON DELETE RESTRICT` | Restringe | Impide eliminar un dueño que tenga mascotas registradas. Garantiza que ninguna mascota quede huérfana (sin propietario) en la base de datos. |
| `ON UPDATE CASCADE` | Cascada | Si el `id_dueno` cambia (operación de mantenimiento interna), la referencia en `mascotas` se actualiza automáticamente, evitando inconsistencias. |

#### `citas → mascotas` (`fk_citas_mascota`)

| Evento | Política | Razón |
|---|---|---|
| `ON DELETE RESTRICT` | Restringe | El historial médico de una mascota (sus citas) es un registro clínico histórico crítico. Eliminar una mascota sin antes resolver sus citas activas o históricas podría borrar información vital. |
| `ON UPDATE CASCADE` | Cascada | Propaga los cambios de PK automáticamente para mantener coherencia. |

#### `citas → veterinarios` (`fk_citas_veterinario`)

| Evento | Política | Razón |
|---|---|---|
| `ON DELETE RESTRICT` | Restringe | No se puede eliminar un veterinario si tiene citas asociadas, ya que las citas pasadas conforman el registro de atención médica del profesional. |
| `ON UPDATE CASCADE` | Cascada | Mantiene la integridad si el PK del veterinario se modifica. |

#### Restricciones adicionales implementadas

- **`UNIQUE (email)`** en `duenos`: Garantiza que cada cliente tenga una dirección de correo exclusiva, cumpliendo la regla de negocio explícita.
- **`UNIQUE (num_licencia)`** en `veterinarios`: La licencia médica es un identificador único nacional; la restricción evita duplicados.
- **`NOT NULL`** en todos los campos obligatorios del modelo de negocio.
- **`CHECK (costo >= 0)`** en `citas`: Validación a nivel de base de datos que impide registrar costos negativos, tal como especifica el enunciado.
- **Charset `utf8mb4`**: Soporta el alfabeto español completo (tildes, ñ) y emojis, evitando problemas de codificación.