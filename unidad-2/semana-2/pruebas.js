/**
 * pruebas.js
 * Suite de pruebas para el Sistema de Gestión de Finanzas Personales
 * Cubre: CuentaBancaria, CuentaAhorros, CuentaCorriente
 */

import { CuentaBancaria, CuentaAhorros, CuentaCorriente } from "./finanzas.js";

// ── Utilidad para mostrar resultados de prueba ────────────────────────────────

let pasadas = 0;
let fallidas = 0;

function prueba(descripcion, fn) {
    try {
        fn();
        console.log(`  ✅ ${descripcion}`);
        pasadas++;
    } catch (error) {
        console.error(`  ❌ ${descripcion}`);
        console.error(`     → ${error.message}`);
        fallidas++;
    }
}

function afirmar(condicion, mensajeFallo) {
    if (!condicion) throw new Error(mensajeFallo ?? "Afirmación fallida");
}

function afirmarLanzaError(fn, mensajeEsperado) {
    try {
        fn();
        throw new Error("Se esperaba un error pero no se lanzó ninguno.");
    } catch (error) {
        if (mensajeEsperado && !error.message.includes(mensajeEsperado)) {
            throw new Error(
                `Error inesperado. Esperado: "${mensajeEsperado}". Recibido: "${error.message}"`
            );
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 1: CuentaBancaria (clase base)
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📋 CuentaBancaria — Clase Base");

prueba("Crea una cuenta con titular y saldo válidos", () => {
    const cuenta = new CuentaBancaria("Ana Torres", 200000);
    afirmar(cuenta.titular === "Ana Torres", "El titular no coincide.");
    afirmar(cuenta.saldo === 200000, "El saldo inicial no coincide.");
});

prueba("Lanza error si el saldo inicial es negativo", () => {
    afirmarLanzaError(
        () => new CuentaBancaria("Juan López", -500),
        "saldo negativo"
    );
});

prueba("Lanza error si el titular está vacío", () => {
    afirmarLanzaError(
        () => new CuentaBancaria("   ", 1000),
        "titular"
    );
});

prueba("El campo #saldo no es accesible directamente", () => {
    const cuenta = new CuentaBancaria("Prueba", 1000);
    afirmar(cuenta["#saldo"] === undefined, "El campo privado #saldo es accesible externamente.");
});

prueba("depositar() incrementa el saldo correctamente", () => {
    const cuenta = new CuentaBancaria("María Gómez", 100000);
    cuenta.depositar(50000);
    afirmar(cuenta.saldo === 150000, `Saldo esperado 150000, obtenido ${cuenta.saldo}`);
});

prueba("retirar() disminuye el saldo correctamente", () => {
    const cuenta = new CuentaBancaria("Carlos Ruiz", 100000);
    cuenta.retirar(30000);
    afirmar(cuenta.saldo === 70000, `Saldo esperado 70000, obtenido ${cuenta.saldo}`);
});

prueba("retirar() lanza error si el monto supera el saldo", () => {
    const cuenta = new CuentaBancaria("Pedro Sal", 50000);
    afirmarLanzaError(() => cuenta.retirar(100000), "Fondos insuficientes");
});

prueba("depositar() lanza error con monto negativo o cero", () => {
    const cuenta = new CuentaBancaria("Lucía Vera", 100000);
    afirmarLanzaError(() => cuenta.depositar(-500), "positivo");
    afirmarLanzaError(() => cuenta.depositar(0), "positivo");
});


// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 2: CuentaAhorros
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📋 CuentaAhorros — Especialización con Saldo Mínimo");

prueba("Crea una CuentaAhorros con saldo mínimo por defecto", () => {
    const cuenta = new CuentaAhorros("Diana Paz", 200000);
    afirmar(cuenta.saldoMinimo === 50000, "El saldo mínimo por defecto debe ser 50000.");
});

prueba("Lanza error si el saldo inicial es menor al mínimo", () => {
    afirmarLanzaError(
        () => new CuentaAhorros("Ernesto Lima", 10000, 50000),
        "saldo mínimo"
    );
});

prueba("retirar() permite retiro si el saldo remanente supera el mínimo", () => {
    const cuenta = new CuentaAhorros("Sofía Mora", 300000, 50000);
    cuenta.retirar(200000);
    afirmar(cuenta.saldo === 100000, `Saldo esperado 100000, obtenido ${cuenta.saldo}`);
});

prueba("retirar() rechaza retiro si el saldo quedaría bajo el mínimo", () => {
    const cuenta = new CuentaAhorros("Felipe Roa", 100000, 50000);
    afirmarLanzaError(() => cuenta.retirar(70000), "por debajo del mínimo");
});

prueba("depositar() funciona normalmente en CuentaAhorros (herencia)", () => {
    const cuenta = new CuentaAhorros("Valeria Ríos", 100000);
    cuenta.depositar(50000);
    afirmar(cuenta.saldo === 150000, `Saldo esperado 150000, obtenido ${cuenta.saldo}`);
});


// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 3: CuentaCorriente
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📋 CuentaCorriente — Especialización con Sobregiro");

prueba("Crea una CuentaCorriente con límite y comisión por defecto", () => {
    const cuenta = new CuentaCorriente("Roberto Díaz", 500000);
    afirmar(cuenta.limiteSobregiro === 1000000, "Límite de sobregiro incorrecto.");
    afirmar(cuenta.comisionSobregiro === 0.05, "Comisión de sobregiro incorrecta.");
});

prueba("retirar() dentro del saldo no aplica comisión", () => {
    const cuenta = new CuentaCorriente("Claudia Vega", 200000);
    cuenta.retirar(100000);
    afirmar(cuenta.saldo === 100000, `Saldo esperado 100000, obtenido ${cuenta.saldo}`);
});

prueba("retirar() con sobregiro aplica comisión sobre el excedente", () => {
    const cuenta = new CuentaCorriente("Andrés Leal", 100000, 500000, 0.10);
    // Retira 200000: 100000 del saldo + 100000 del sobregiro
    // Comisión = 100000 * 0.10 = 10000
    // Total debitado = 200000 + 10000 = 210000
    // Saldo final = 100000 - 210000 = -110000
    cuenta.retirar(200000);
    afirmar(
        Math.abs(cuenta.saldo - (-110000)) < 0.01,
        `Saldo esperado -110000, obtenido ${cuenta.saldo}`
    );
});

prueba("retirar() rechaza si supera saldo + límite de sobregiro", () => {
    const cuenta = new CuentaCorriente("Natalia Cruz", 100000, 200000);
    afirmarLanzaError(() => cuenta.retirar(400000), "excede");
});

prueba("Lanza error si el límite de sobregiro es negativo", () => {
    afirmarLanzaError(
        () => new CuentaCorriente("Oscar Mejía", 100000, -5000),
        "negativo"
    );
});

prueba("depositar() funciona normalmente en CuentaCorriente (herencia)", () => {
    const cuenta = new CuentaCorriente("Paola Soto", 50000);
    cuenta.depositar(30000);
    afirmar(cuenta.saldo === 80000, `Saldo esperado 80000, obtenido ${cuenta.saldo}`);
});


// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 4: Polimorfismo
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n📋 Polimorfismo — Comportamiento diferenciado via herencia");

prueba("instanceof reconoce la jerarquía correctamente", () => {
    const ahorros = new CuentaAhorros("Test A", 200000);
    const corriente = new CuentaCorriente("Test B", 100000);

    afirmar(ahorros instanceof CuentaBancaria, "CuentaAhorros debe ser instancia de CuentaBancaria.");
    afirmar(corriente instanceof CuentaBancaria, "CuentaCorriente debe ser instancia de CuentaBancaria.");
    afirmar(!(ahorros instanceof CuentaCorriente), "CuentaAhorros NO debe ser instancia de CuentaCorriente.");
});

prueba("toString() muestra el nombre de clase correcto para cada tipo", () => {
    const base = new CuentaBancaria("Base", 1000);
    const ahorros = new CuentaAhorros("Ahorros", 200000);
    const corriente = new CuentaCorriente("Corriente", 100000);

    afirmar(base.toString().includes("CuentaBancaria"), "toString base incorrecto.");
    afirmar(ahorros.toString().includes("CuentaAhorros"), "toString ahorros incorrecto.");
    afirmar(corriente.toString().includes("CuentaCorriente"), "toString corriente incorrecto.");
});


// ─────────────────────────────────────────────────────────────────────────────
// Resumen final
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────────");
console.log(`Resultado: ${pasadas} pruebas pasadas | ${fallidas} fallidas`);
if (fallidas === 0) {
    console.log("🎉 Todas las pruebas pasaron exitosamente.");
} else {
    console.log("⚠️  Revisa los errores marcados con ❌.");
}
console.log("─────────────────────────────────────────────\n");
