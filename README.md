# Hotwheels Collector - Core Analítico

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react&logoColor=black)
![EF Core](https://img.shields.io/badge/EF_Core-ORM-512BD4?style=flat-square&logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)
![Status](https://img.shields.io/badge/Status-Work_In_Progress_(Progreso_2)-orange?style=flat-square)

## Descripción del Proyecto

La plataforma **Hotwheels Collector** busca transformar un inventario estático de vehículos a escala en una herramienta de inteligencia de mercado. El corazón de este sistema es el **MSVP (Motor de Similitud y Valoración Proyectada)**, diseñado para simular y proyectar escenarios financieros de plusvalía y rareza en colecciones, convirtiendo un simple catálogo en una verdadera plataforma analítica y predictiva.

## Estado Actual del Avance (Progreso 2)

> [!NOTE]
> Esta entrega representa el avance intermedio del **Core analítico desacoplado**, estructurado de la siguiente manera:
>
> - **Backend**: Arquitectura Web API funcional con enrutamiento REST, inyección de dependencias y el algoritmo matemático del MSVP en C# procesando escenarios de plusvalía a 1, 5, 10 y 20 años basados en interés compuesto y factores de rareza (Mainline, STH, RLC).
> - **Persistencia**: Modelado relacional 1:1 mediante Entity Framework Core conectado de forma remota a PostgreSQL en Supabase, inicializado a través de un script físico `seed.sql`.
> - **Frontend**: Interfaz SPA reactiva construida en React que consume asíncronamente (Fetch API) los endpoints del backend, permitiendo simular proyecciones financieras en tiempo real desde el Dashboard de Scouting.

## Estructura del Repositorio

El proyecto utiliza una arquitectura de monorepo desacoplado:

```
Hotwheels-Collector-Core/
├── backend/          # API RESTful en ASP.NET Core 8 con el MSVP
├── frontend/         # Interfaz de Usuario SPA en React + Vite
├── seed.sql          # Script físico de persistencia e inicialización (PostgreSQL)
└── README.md         # Documentación técnica
```

## Instrucciones de Inicialización Local

Para levantar el ecosistema en desarrollo, sigue los siguientes pasos:

### 1. Iniciar el Backend (.NET 8 API)

Navega a la carpeta del backend y ejecuta el proyecto:

```bash
cd backend
dotnet run
```
*La API estará expuesta y lista para recibir peticiones.*

### 2. Iniciar el Frontend (React SPA)

En una nueva terminal, navega a la carpeta del frontend y levanta el servidor de desarrollo Vite:

```bash
cd frontend
npm run dev
```
*Abre la URL proporcionada por Vite en tu navegador para interactuar con el Dashboard de Scouting.*
