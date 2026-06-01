# Guía de Refactorización en Vivo del CORE C# (.NET 8)

Este documento es un artefacto de estudio clínico diseñado para enfrentar solicitudes de reingeniería en tiempo real (Live Coding) durante la defensa técnica del código. Explora alternativas sintácticas y algorítmicas para demostrar dominio absoluto sobre las estructuras de control, la manipulación de colecciones y el modelado matemático en C#.

---

## 1. Mutación del Motor de Scouting: LINQ vs. Bucles Imperativos

El evaluador puede solicitar que se desmantele el uso de sentencias declarativas LINQ (`.Select()`, `.OrderBy()`) en favor de una aproximación procedimental clásica para demostrar la comprensión del control de flujo subyacente.

### 1.1 Implementación Actual (Declarativa / Funcional)
En `ScoutingEngineService.cs`, la proximidad se mapea y ordena en memoria mediante la sintaxis moderna encadenada:

```csharp
// Proyección y cálculo
var evaluados = candidatos.Select(c =>
{
    int cAnio = parseModelo(c.Modelo);
    // ... cálculos de deltas ...
    double mpi = Math.Sqrt(mpiCuadrado);
    return new { Vehiculo = c, Score = mpi };
});

// Ordenamiento y extracción
return evaluados
    .OrderBy(e => e.Score)
    .Take(cantidad)
    .Select(e => e.Vehiculo)
    .ToList();
```

### 1.2 Transcripción Equivalente (Imperativa Clásica)
Si se solicita erradicar LINQ, el mismo algoritmo se reescribe iterando secuencialmente con un bloque `foreach`, almacenando en una lista explícita intermedia y utilizando un delegado de comparación (`.Sort()`) para el ordenamiento in-place de los scores.

```csharp
// 1. Declarar una clase o estructura auxiliar (Tuple)
var listaEvaluados = new List<(Hotwheel Vehiculo, double Score)>();

// 2. Iteración procedimental (Reemplazo del .Select)
foreach (var c in candidatos)
{
    int cAnio = parseModelo(c.Modelo);
    decimal deltaPrecio = c.PrecioBase - objetivo.PrecioBase;
    decimal deltaAnio = (decimal)(cAnio - objetivoAnio);
    
    double mpiCuadrado = (double)(w1 * (deltaPrecio * deltaPrecio) + w2 * (deltaAnio * deltaAnio));
    double mpi = Math.Sqrt(mpiCuadrado);
    
    listaEvaluados.Add((c, mpi));
}

// 3. Ordenamiento in-place en memoria (Reemplazo del .OrderBy)
listaEvaluados.Sort((x, y) => x.Score.CompareTo(y.Score));

// 4. Extracción de la subcolección (Reemplazo de .Take y .Select)
var resultadosFinales = new List<Hotwheel>();
int limite = Math.Min(cantidad, listaEvaluados.Count);

for (int i = 0; i < limite; i++)
{
    resultadosFinales.Add(listaEvaluados[i].Vehiculo);
}

return resultadosFinales;
```

---

## 2. Expansión Estructural de la Fórmula de Proximidad (MPI)

Para demostrar escalabilidad matemática, el docente podría requerir incorporar una tercera dimensión a la Distancia Euclidiana (ej. el nivel de "Condición/Estado" del vehículo en escala 1-10).

### 2.1 Alteración del Equilibrio Ponderado
Al agregar un eje $Z$, los pesos relativos ($w_1, w_2, w_3$) deben re-balancearse idealmente para que su sumatoria absoluta tienda a $1.0$ ($100\%$).

```csharp
// Modificación de variables de peso
decimal w1 = 0.5m; // Peso Precio (bajó al 50%)
decimal w2 = 0.2m; // Peso Año Modelo (bajó al 20%)
decimal w3 = 0.3m; // Peso NUEVO EJE Estado (30%)
```

### 2.2 Alteración de la Ecuación Base
Bajo la raíz cuadrada, simplemente se inyecta un tercer diferencial al cuadrado ponderado sumándose a la función subyacente.

```csharp
// Cálculo del tercer delta (Asumiendo que c.Estado y objetivo.Estado existen y son enteros)
decimal deltaEstado = (decimal)(c.Estado - objetivo.Estado);

// Inyección en la sumatoria polinómica
double mpiCuadrado = (double)(
    (w1 * (deltaPrecio * deltaPrecio)) + 
    (w2 * (deltaAnio * deltaAnio)) + 
    (w3 * (deltaEstado * deltaEstado)) // <-- Tercer eje inyectado
);

// El cómputo raíz final se mantiene idéntico
double mpi = Math.Sqrt(mpiCuadrado);
```

---

## 3. Desarmar Sintaxis Moderna (Patrones de Asignación C#)

El framework .NET 8 fomenta el uso de sintaxis de alto nivel como *Switch Expressions*, sin embargo, su desestructuración demuestra una comprensión sólida de las bases del lenguaje C#.

### 3.1 Implementación Actual (Switch Expression de C# 8.0+)
En `MSVPService.cs`, la tasa base de interés se asigna mediante evaluación de patrones concisos:

```csharp
decimal tasaBase = hotwheel.Rareza switch
{
    "Mainline" => 0.05m,
    "STH" => 0.15m,
    "RLC" => 0.25m,
    _ => 0.0m
};
```

### 3.2 Transcripción: Switch Case Clásico
Estructura verbosa, idónea si el evaluador requiere inyectar lógica de depuración (`Console.WriteLine`) dentro de los bloques evaluados, lo cual es imposible en la expresión en línea superior.

```csharp
decimal tasaBase;

switch (hotwheel.Rareza)
{
    case "Mainline":
        tasaBase = 0.05m;
        break;
    case "STH":
        tasaBase = 0.15m;
        break;
    case "RLC":
        tasaBase = 0.25m;
        break;
    default:
        tasaBase = 0.0m;
        break;
}
```

### 3.3 Transcripción: Cadena de If / Else-If
Estructura fundamental. Es mandatoria cuando las condiciones de evaluación dejan de ser igualdades exactas y se transforman en evaluaciones relacionales (ej. `if (rareza.Contains("..."))`).

```csharp
decimal tasaBase = 0.0m; // Asignación del valor default de seguridad

if (hotwheel.Rareza == "Mainline")
{
    tasaBase = 0.05m;
}
else if (hotwheel.Rareza == "STH")
{
    tasaBase = 0.15m;
}
else if (hotwheel.Rareza == "RLC")
{
    tasaBase = 0.25m;
}
```

---

## 4. Inyección Rápida de Multiplicadores Dinámicos (MSVP)

Si el objetivo de la evaluación es observar cómo el sistema de riesgo es alterado estructuralmente, se debe intervenir el bloque interno de iteración en `MSVPService.cs`.

### 4.1 Modificación de Coeficientes de Desviación de Riesgo
Actualmente, el escenario pesimista corta el impacto del factor a la mitad (`0.5m`) y el optimista lo dispara al ciento cincuenta por ciento (`1.5m`). Para endurecer las reglas financieras en vivo, se ajustan directamente los multiplicadores fraccionales:

```csharp
// ORIGINAL (Conservador al 50%)
decimal incrementoConservador = valorCompuesto * factor.ImpactoPorcentaje * 0.5m;

// MODIFICACIÓN EN VIVO: Riesgo Agudo (Depresión de mercado severa, cae al 20%)
decimal incrementoConservador = valorCompuesto * factor.ImpactoPorcentaje * 0.2m;
```

### 4.2 Inyección de Penalización Fija (Flat Penalty)
El evaluador podría solicitar que, adicional al impacto porcentual, el vehículo se devalúe por una tarifa de almacenamiento fija independientemente del impacto real (ej. descontar `$5.00` fijos anuales de custodia):

```csharp
// Modificación del comportamiento esperado inyectando una constante matemática negativa
decimal tarifaCustodiaBase = 5.00m;

// Impacto base de mercado menos la tasa flat de custodia
decimal incrementoEsperado = (valorCompuesto * factor.ImpactoPorcentaje) - tarifaCustodiaBase;

// Medida de seguridad: Evitar que el incremento absoluto invierta la base total (quiebre del activo)
if (incrementoEsperado < -valorCompuesto) 
{
    incrementoEsperado = -valorCompuesto;
}
```
