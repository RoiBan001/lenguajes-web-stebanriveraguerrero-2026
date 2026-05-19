/**
 * seguridad.js
 * Encapsulamiento mediante Closures
 *
 * Implementa `crearSistemaSegurid` que retorna un objeto con métodos
 * para gestionar una clave de acceso de forma privada.
 * La clave es completamente inaccesible desde el entorno global;
 * solo puede modificarse y validarse a través de la interfaz expuesta.
 */

const crearSistemaSeguridad = (claveInicial) => {
    // Variable privada: vive en el closure, inaccesible desde el exterior
    let clavePrivada = claveInicial;

    // Retorna únicamente la interfaz pública
    return {
        /**
         * Valida si la clave proporcionada coincide con la clave privada.
         * @param {string} claveIngresada - Clave a verificar.
         * @returns {boolean} true si la clave es correcta, false en caso contrario.
         */
        validarClave(claveIngresada) {
            return claveIngresada === clavePrivada;
        },

        /**
         * Actualiza la clave privada, previa verificación de la clave actual.
         * @param {string} claveActual - La clave vigente para autorizar el cambio.
         * @param {string} clavaNueva - La nueva clave que reemplazará a la actual.
         * @returns {string} Mensaje indicando el resultado de la operación.
         */
        cambiarClave(claveActual, clavaNueva) {
            if (claveActual !== clavePrivada) {
                return "Error: La clave actual es incorrecta. No se realizaron cambios.";
            }

            if (typeof clavaNueva !== "string" || clavaNueva.trim().length === 0) {
                return "Error: La nueva clave no puede estar vacía.";
            }

            clavePrivada = clavaNueva;
            return "Clave actualizada correctamente.";
        },

        /**
         * Retorna el estado del sistema sin exponer la clave.
         * @returns {string} Mensaje de estado.
         */
        obtenerEstado() {
            return "Sistema de seguridad activo. Clave configurada y protegida.";
        },
    };
};


// ─────────────────────────────────────────────────────────────────────────────
// Pruebas del sistema
// ─────────────────────────────────────────────────────────────────────────────

const sistema = crearSistemaSeguridad("acceso123");

// Verificar que la clave no es accesible directamente desde el exterior
console.log("¿La clave es accesible directamente?", sistema.clavePrivada);
// Output: undefined — la clave está protegida por el closure

// Validar con clave incorrecta
console.log("Validación con clave incorrecta:", sistema.validarClave("wrongpass"));
// Output: false

// Validar con clave correcta
console.log("Validación con clave correcta:", sistema.validarClave("acceso123"));
// Output: true

// Intentar cambiar la clave con la clave actual incorrecta
console.log(sistema.cambiarClave("wrongpass", "nueva456"));
// Output: "Error: La clave actual es incorrecta. No se realizaron cambios."

// Cambiar la clave correctamente
console.log(sistema.cambiarClave("acceso123", "nueva456"));
// Output: "Clave actualizada correctamente."

// Validar que la nueva clave funciona
console.log("Validación con nueva clave:", sistema.validarClave("nueva456"));
// Output: true

// Confirmar que la clave antigua ya no es válida
console.log("La clave antigua ya no es válida:", sistema.validarClave("acceso123"));
// Output: false

// Estado del sistema
console.log(sistema.obtenerEstado());
// Output: "Sistema de seguridad activo. Clave configurada y protegida."
