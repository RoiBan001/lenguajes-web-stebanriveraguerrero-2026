/**
 * logica.js
 * Procesamiento de Inventario de Librería
 * Utiliza exclusivamente métodos funcionales de la interfaz Array:
 * filter, map, reduce, sort
 */

const libros = [
    { titulo: "El Aleph", autor: "Borges", ventas: 500, stock: 10 },
    { titulo: "Rayuela", autor: "Cortázar", ventas: 1200, stock: 2 },
    { titulo: "Ficciones", autor: "Borges", ventas: 850, stock: 5 },
    { titulo: "100 años de soledad", autor: "García Márquez", ventas: 3000, stock: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Lista de títulos con ventas superiores a 1000 unidades
// ─────────────────────────────────────────────────────────────────────────────

const titulosConAltasVentas = libros
    .filter((libro) => libro.ventas > 1000)
    .map((libro) => libro.titulo);

console.log("1. Títulos con ventas superiores a 1000 unidades:");
console.log(titulosConAltasVentas);
// Output esperado: ["Rayuela", "100 años de soledad"]


// ─────────────────────────────────────────────────────────────────────────────
// 2. Sumatoria total de ventas del autor "Borges"
// ─────────────────────────────────────────────────────────────────────────────

const totalVentasBorges = libros
    .filter((libro) => libro.autor === "Borges")
    .reduce((acumulador, libro) => acumulador + libro.ventas, 0);

console.log("\n2. Total de ventas del autor Borges:");
console.log(totalVentasBorges);
// Output esperado: 1350 (500 + 850)


// ─────────────────────────────────────────────────────────────────────────────
// 3. Nueva estructura con título, disponibilidad y ordenada por ventas desc.
// ─────────────────────────────────────────────────────────────────────────────

const inventarioOrdenado = libros
    .map((libro) => ({
        titulo: libro.titulo,
        disponibilidad: libro.stock > 0 ? "Disponible" : "Agotado",
        ventas: libro.ventas,
    }))
    .sort((a, b) => b.ventas - a.ventas);

console.log("\n3. Inventario con disponibilidad, ordenado por ventas (descendente):");
console.log(inventarioOrdenado);
/*
Output esperado:
[
  { titulo: "100 años de soledad", disponibilidad: "Agotado",    ventas: 3000 },
  { titulo: "Rayuela",             disponibilidad: "Disponible", ventas: 1200 },
  { titulo: "Ficciones",           disponibilidad: "Disponible", ventas: 850  },
  { titulo: "El Aleph",            disponibilidad: "Disponible", ventas: 500  },
]
*/
