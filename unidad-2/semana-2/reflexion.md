# Justificación Arquitectónica — Sistema de Gestión de Finanzas Personales

## 1. Análisis de Paradigmas

### POO con Clases vs. Modelo Funcional vs. Objetos Literales

Para el dominio de un sistema financiero, la elección del paradigma tiene consecuencias directas sobre la mantenibilidad, la seguridad de datos y la capacidad de crecimiento del sistema. A continuación se comparan las tres alternativas:

---

#### Modelo basado en Objetos Literales

```javascript
// Ejemplo conceptual — objeto literal
const cuentaAhorros = {
    titular: "Ana Torres",
    saldo: 200000,
    retirar(monto) { this.saldo -= monto; }
};
```

**Ventajas:**
- Sintaxis simple y directa; ideal para prototipos rápidos.
- Sin boilerplate de clases ni herencia.

**Desventajas críticas para este dominio:**
- **Sin encapsulamiento real:** Cualquier parte del código puede modificar `cuentaAhorros.saldo = -999999` directamente, violando la integridad financiera.
- **Sin herencia estructurada:** Compartir lógica entre tipos de cuenta (ahorros, corriente) requiere duplicación de código o composición manual, aumentando el riesgo de inconsistencias.
- **Sin validación de estado:** No hay un único punto de control para garantizar que las reglas de negocio se apliquen siempre.
- **Escalabilidad limitada:** Agregar un nuevo tipo de cuenta obliga a replicar manualmente la estructura base.

**Veredicto:** Inadecuado para sistemas financieros de producción.

---

#### Modelo Funcional Puro

```javascript
// Ejemplo conceptual — enfoque funcional
const crearCuenta = (titular, saldo) => ({ titular, saldo });
const depositar = (cuenta, monto) => ({ ...cuenta, saldo: cuenta.saldo + monto });
const retirar = (cuenta, monto) => {
    if (monto > cuenta.saldo) throw new Error("Fondos insuficientes");
    return { ...cuenta, saldo: cuenta.saldo - monto };
};
```

**Ventajas:**
- Inmutabilidad: cada operación retorna un nuevo objeto, facilitando la trazabilidad de cambios (ideal para auditorías).
- Funciones puras: fáciles de probar en aislamiento.
- Composición: comportamientos se combinan sin herencia.

**Desventajas para este dominio:**
- **Sin encapsulamiento de estado:** El campo `saldo` sigue siendo accesible y mutable directamente en el objeto retornado.
- **Especialización compleja:** Implementar variaciones de comportamiento (ej. lógica de sobregiro vs. saldo mínimo) requiere múltiples funciones y convenciones de nomenclatura que no garantizan contratos de interfaz.
- **Identidad de entidad difusa:** En finanzas, una cuenta *es* una entidad con identidad persistente. El modelo funcional trata los datos como valores transformados, lo que dificulta el rastreo de la "misma cuenta" a través del tiempo.

**Veredicto:** Aporta valor en capas de transformación de datos (reportes, cálculos), pero no como núcleo del modelado de entidades financieras.

---

#### Modelo Orientado a Objetos con Clases (solución adoptada)

```javascript
class CuentaBancaria {
    #saldo;
    #titular;
    // ...
}
```

**Ventajas determinantes para este dominio:**
- **Encapsulamiento real con campos privados (`#`):** El saldo y el titular no pueden ser modificados desde el exterior. Toda mutación pasa por métodos que aplican validaciones de negocio.
- **Herencia jerárquica:** `CuentaAhorros` y `CuentaCorriente` extienden `CuentaBancaria`, reutilizando la lógica transaccional base y sobreescribiendo únicamente el comportamiento específico (`retirar()`).
- **Polimorfismo:** Una función que recibe una `CuentaBancaria` funciona con cualquier subtipo, permitiendo tratar colecciones mixtas de cuentas con una interfaz unificada.
- **Contratos claros:** Los constructores son la única puerta de entrada para crear instancias válidas, garantizando que ningún objeto exista en un estado inconsistente.

**Veredicto:** El paradigma más adecuado para modelar entidades financieras con reglas de negocio diferenciadas y requisitos estrictos de integridad de datos.

---

## 2. Seguridad de Datos — Miembros Privados en el Contexto Financiero

### Importancia Técnica del Encapsulamiento

En un sistema de gestión financiera, el saldo de una cuenta es el dato más crítico del dominio. Cualquier escritura directa a ese valor, sin pasar por la lógica de validación, representa una vulnerabilidad de integridad del sistema.

La sintaxis de **campos privados de clase** (`#campo`) de ES2022 provee privacidad a nivel del motor de JavaScript, a diferencia de las convenciones anteriores como el prefijo `_campo` que era solo un acuerdo informal:

```javascript
const cuenta = new CuentaBancaria("Ana", 100000);

// Intento de acceso o modificación directa — falla con SyntaxError o retorna undefined
cuenta.#saldo = -999999;   // SyntaxError en tiempo de ejecución
cuenta["#saldo"];          // undefined — el campo no existe como propiedad enumerable
```

Esto garantiza que la única forma de alterar el saldo es a través de `depositar()` y `retirar()`, métodos que aplican:
1. Validación de tipo y rango del monto.
2. Verificación de reglas de negocio específicas del tipo de cuenta.
3. Una actualización atómica del estado interno.

Este patrón elimina categorías completas de bugs: actualizaciones accidentales desde módulos externos, mutaciones en bucles de iteración, o errores de sincronización en sistemas con múltiples operaciones pendientes.

---

## 3. Escalabilidad — Integración de Nuevos Productos Financieros

### Procedimiento para Extender la Jerarquía

La arquitectura de clases adoptada está diseñada para crecer sin modificar el código existente, siguiendo el **Principio Abierto/Cerrado** (Open/Closed Principle).

Para incorporar un nuevo producto financiero, como un **Crédito de Consumo** o una **Cuenta de Inversión**, el procedimiento es:

#### Paso 1 — Identificar el tipo base

Determinar si el nuevo producto comparte la naturaleza de `CuentaBancaria` (saldo, titular, depósitos/retiros). Si es así, extender esta clase. Si el dominio es suficientemente diferente, considerar una clase base paralela o una interfaz abstracta.

#### Paso 2 — Crear la subclase con atributos privados propios

```javascript
class CuentaInversion extends CuentaBancaria {
    #tasaRendimiento;
    #plazoMeses;

    constructor(titular, capitalInicial, tasaRendimiento, plazoMeses) {
        super(titular, capitalInicial);
        this.#tasaRendimiento = tasaRendimiento;
        this.#plazoMeses = plazoMeses;
    }

    calcularRendimiento() {
        return this.saldo * this.#tasaRendimiento * this.#plazoMeses;
    }

    // Sobreescribir retirar() si aplican restricciones de liquidez
    retirar(monto) {
        throw new Error("Las cuentas de inversión no permiten retiros antes del vencimiento del plazo.");
    }
}
```

#### Paso 3 — Sobreescribir únicamente los métodos que cambian

Los métodos heredados (`depositar()`, `toString()`, `_ajustarSaldo()`) funcionan sin modificación. Solo se sobreescribe `retirar()` si las reglas del nuevo producto difieren del comportamiento base.

#### Paso 4 — Verificar compatibilidad con el código existente

Gracias al polimorfismo, cualquier función o módulo que opere con instancias de `CuentaBancaria` acepta automáticamente instancias del nuevo tipo sin cambios:

```javascript
function procesarDeposito(cuenta, monto) {
    // Funciona con CuentaBancaria, CuentaAhorros, CuentaCorriente, CuentaInversion, etc.
    return cuenta.depositar(monto);
}
```

#### Consideraciones de estabilidad del sistema

- **No modificar la clase base:** Toda lógica nueva va en la subclase. Modificar `CuentaBancaria` puede romper `CuentaAhorros` y `CuentaCorriente`.
- **Pruebas de regresión:** Ejecutar `pruebas.js` después de cada nueva clase para garantizar que el comportamiento base no ha sido alterado.
- **Documentación del contrato:** Cada subclase debe documentar explícitamente qué métodos sobreescribe y por qué, para facilitar el mantenimiento futuro.

---

## Conclusión

La elección del paradigma orientado a objetos con clases y campos privados de ES2022 no es arbitraria: responde directamente a los requerimientos del dominio financiero. El encapsulamiento protege la integridad del saldo, la herencia elimina la duplicación de lógica transaccional, y el polimorfismo garantiza que el sistema pueda crecer con nuevos productos sin comprometer la estabilidad del código existente.
