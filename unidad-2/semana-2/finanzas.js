/**
 * finanzas.js
 * Sistema de Gestión de Finanzas Personales
 * Arquitectura de Objetos y Modelado de Dominio
 *
 * Implementa la jerarquía de clases:
 *   CuentaBancaria (base)
 *   ├── CuentaAhorros
 *   └── CuentaCorriente
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Clase Base: CuentaBancaria
// ─────────────────────────────────────────────────────────────────────────────

class CuentaBancaria {
    // Campos privados — sintaxis ES2022
    #saldo;
    #titular;

    /**
     * @param {string} titular - Nombre del titular de la cuenta.
     * @param {number} saldoInicial - Saldo con el que se apertura la cuenta.
     * @throws {Error} Si el saldo inicial es negativo.
     */
    constructor(titular, saldoInicial) {
        if (typeof titular !== "string" || titular.trim().length === 0) {
            throw new Error("El titular debe ser un nombre válido.");
        }
        if (saldoInicial < 0) {
            throw new Error("No se puede crear una cuenta con saldo negativo.");
        }

        this.#titular = titular.trim();
        this.#saldo = saldoInicial;
    }

    // ── Getters (interfaz de lectura) ─────────────────────────────────────────

    get titular() {
        return this.#titular;
    }

    get saldo() {
        return this.#saldo;
    }

    // ── Operaciones transaccionales ───────────────────────────────────────────

    /**
     * Deposita un monto en la cuenta.
     * @param {number} monto - Cantidad a depositar (debe ser positiva).
     * @returns {string} Confirmación de la operación.
     */
    depositar(monto) {
        if (typeof monto !== "number" || monto <= 0) {
            throw new Error("El monto a depositar debe ser un número positivo.");
        }
        this.#saldo += monto;
        return `Depósito de $${monto.toFixed(2)} realizado. Saldo actual: $${this.#saldo.toFixed(2)}`;
    }

    /**
     * Retira un monto de la cuenta. Puede ser sobreescrito por subclases.
     * @param {number} monto - Cantidad a retirar (debe ser positiva).
     * @returns {string} Confirmación de la operación.
     */
    retirar(monto) {
        if (typeof monto !== "number" || monto <= 0) {
            throw new Error("El monto a retirar debe ser un número positivo.");
        }
        if (monto > this.#saldo) {
            throw new Error(`Fondos insuficientes. Saldo disponible: $${this.#saldo.toFixed(2)}`);
        }
        this.#saldo -= monto;
        return `Retiro de $${monto.toFixed(2)} realizado. Saldo actual: $${this.#saldo.toFixed(2)}`;
    }

    /**
     * Método protegido para que las subclases puedan modificar el saldo interno.
     * Encapsula la lógica de modificación sin exponer #saldo directamente.
     * @param {number} cantidad - Puede ser positiva (crédito) o negativa (débito).
     */
    _ajustarSaldo(cantidad) {
        this.#saldo += cantidad;
    }

    /**
     * Representación legible de la cuenta.
     */
    toString() {
        return `[${this.constructor.name}] Titular: ${this.#titular} | Saldo: $${this.#saldo.toFixed(2)}`;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// 2a. Clase Derivada: CuentaAhorros
// ─────────────────────────────────────────────────────────────────────────────

class CuentaAhorros extends CuentaBancaria {
    #saldoMinimo;

    /**
     * @param {string} titular - Nombre del titular.
     * @param {number} saldoInicial - Saldo inicial de apertura.
     * @param {number} saldoMinimo - Umbral mínimo que debe mantenerse en la cuenta.
     */
    constructor(titular, saldoInicial, saldoMinimo = 50000) {
        super(titular, saldoInicial);

        if (saldoInicial < saldoMinimo) {
            throw new Error(
                `El saldo inicial ($${saldoInicial}) no puede ser inferior al saldo mínimo requerido ($${saldoMinimo}).`
            );
        }

        this.#saldoMinimo = saldoMinimo;
    }

    get saldoMinimo() {
        return this.#saldoMinimo;
    }

    /**
     * Sobreescribe el retiro para validar que el saldo remanente
     * no caiga por debajo del umbral mínimo institucional.
     * @param {number} monto - Cantidad a retirar.
     * @returns {string} Confirmación de la operación.
     */
    retirar(monto) {
        if (typeof monto !== "number" || monto <= 0) {
            throw new Error("El monto a retirar debe ser un número positivo.");
        }

        const saldoResultante = this.saldo - monto;

        if (saldoResultante < this.#saldoMinimo) {
            throw new Error(
                `Retiro rechazado. El saldo resultante ($${saldoResultante.toFixed(2)}) ` +
                `quedaría por debajo del mínimo requerido ($${this.#saldoMinimo.toFixed(2)}).`
            );
        }

        this._ajustarSaldo(-monto);
        return `Retiro de $${monto.toFixed(2)} realizado. Saldo actual: $${this.saldo.toFixed(2)}`;
    }

    toString() {
        return `${super.toString()} | Saldo mínimo: $${this.#saldoMinimo.toFixed(2)}`;
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// 2b. Clase Derivada: CuentaCorriente
// ─────────────────────────────────────────────────────────────────────────────

class CuentaCorriente extends CuentaBancaria {
    #limiteSobregiro;
    #comisionSobregiro;

    /**
     * @param {string} titular - Nombre del titular.
     * @param {number} saldoInicial - Saldo inicial de apertura.
     * @param {number} limiteSobregiro - Cupo máximo de sobregiro permitido.
     * @param {number} comisionSobregiro - Comisión (porcentaje decimal) aplicada
     *                                     al monto que utilice el cupo de sobregiro.
     *                                     Ej: 0.05 = 5%.
     */
    constructor(titular, saldoInicial, limiteSobregiro = 1000000, comisionSobregiro = 0.05) {
        super(titular, saldoInicial);

        if (limiteSobregiro < 0) {
            throw new Error("El límite de sobregiro no puede ser negativo.");
        }
        if (comisionSobregiro < 0 || comisionSobregiro > 1) {
            throw new Error("La comisión debe ser un valor entre 0 y 1 (ej: 0.05 para 5%).");
        }

        this.#limiteSobregiro = limiteSobregiro;
        this.#comisionSobregiro = comisionSobregiro;
    }

    get limiteSobregiro() {
        return this.#limiteSobregiro;
    }

    get comisionSobregiro() {
        return this.#comisionSobregiro;
    }

    /**
     * Sobreescribe el retiro para permitir sobregiro hasta el límite preestablecido.
     * Aplica comisión automática sobre la parte del retiro que use el cupo de sobregiro.
     * @param {number} monto - Cantidad a retirar.
     * @returns {string} Confirmación de la operación con desglose de comisiones.
     */
    retirar(monto) {
        if (typeof monto !== "number" || monto <= 0) {
            throw new Error("El monto a retirar debe ser un número positivo.");
        }

        const capacidadTotal = this.saldo + this.#limiteSobregiro;

        if (monto > capacidadTotal) {
            throw new Error(
                `Retiro rechazado. El monto solicitado ($${monto.toFixed(2)}) excede ` +
                `el saldo disponible más el cupo de sobregiro ($${capacidadTotal.toFixed(2)}).`
            );
        }

        // Calcular si se usa cupo de sobregiro y aplicar comisión
        let comisionCobrada = 0;
        const montoEnSobregiro = Math.max(0, monto - this.saldo);

        if (montoEnSobregiro > 0) {
            comisionCobrada = montoEnSobregiro * this.#comisionSobregiro;
        }

        const totalDebito = monto + comisionCobrada;
        this._ajustarSaldo(-totalDebito);

        let mensaje = `Retiro de $${monto.toFixed(2)} realizado.`;
        if (comisionCobrada > 0) {
            mensaje += ` Comisión por sobregiro aplicada: $${comisionCobrada.toFixed(2)}.`;
        }
        mensaje += ` Saldo actual: $${this.saldo.toFixed(2)}`;
        return mensaje;
    }

    toString() {
        return (
            `${super.toString()} | ` +
            `Límite sobregiro: $${this.#limiteSobregiro.toFixed(2)} | ` +
            `Comisión: ${(this.#comisionSobregiro * 100).toFixed(1)}%`
        );
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// Exportaciones (compatible con Node.js / ES Modules)
// ─────────────────────────────────────────────────────────────────────────────

export { CuentaBancaria, CuentaAhorros, CuentaCorriente };
