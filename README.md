# Hotwheels Collector Core — Analytical Platform

![Estado del Proyecto](https://img.shields.io/badge/Estado-Producción-success)
![.NET Version](https://img.shields.io/badge/.NET-8.0-blue)
![React Version](https://img.shields.io/badge/React-19.2-cyan)
![Database](https://img.shields.io/badge/PostgreSQL-Supabase-green)

Plataforma unificada y desplegada en producción: **[https://hotwheels-collector-core.onrender.com](https://hotwheels-collector-core.onrender.com)**

---

## 1. Contexto del Proyecto y Arquitectura

Hotwheels Collector Core es una plataforma analítica avanzada (scouting) diseñada específicamente para el mercado de coleccionismo de vehículos a escala. Su arquitectura está cimentada en un **Monorepo desacoplado**, donde un Backend en .NET 8 (Web API) y un Frontend interactivo en React 19 coexisten y se unifican mediante un pipeline de despliegue multietapa en Docker. 

La persistencia de datos está respaldada por una base de datos relacional PostgreSQL alojada en Supabase, garantizando alta disponibilidad y escalabilidad transaccional.

### Motor de Similitud y Valoración Proyectada (MSVP)

El núcleo algorítmico del sistema (MSVP) ha evolucionado hacia un diseño matemático robusto para simular el comportamiento financiero del mercado de coleccionables. El cálculo se ejecuta en el servidor (backend) mediante una arquitectura de **Bucles Anidados (Nested Loops)**:

1. **Bucle Externo (Cronológico):** Itera a través de intervalos de tiempo definidos ($1, 5, 10, 20$ años). En cada periodo, aplica una fórmula base de interés compuesto, cuya tasa inicial está determinada exclusivamente por la categoría de rareza del vehículo (ej. *Mainline*, *STH*, *RLC*).
2. **Bucle Interno (Macroeconómico):** Dentro de cada salto temporal, el algoritmo itera sobre todos los factores externos activos consultados en tiempo real desde la tabla `factores_externos` de Supabase. Multiplica de forma acumulativa el impacto porcentual de cada factor del mundo real (como inflación del mercado o efectos mediáticos) por el valor base del año actual.

Este enfoque dinámico elimina por completo las constantes (números quemados) del código, permitiendo que la volatilidad de los precios responda integralmente a factores externos variables administrados en la base de datos.

---

## 2. Sistema de Seguridad y Onboarding (RBAC)

La plataforma cuenta con un flujo completo de Onboarding y un sistema de **Control de Acceso Basado en Roles (RBAC)**. 

### Endpoints Transaccionales
La capa de autenticación está gestionada por `AuthController`, exponiendo dos endpoints ligeros y seguros:
- `POST /api/v1/auth/register`: Gestiona el registro de nuevos usuarios, validando estrictamente la duplicidad de correos electrónicos en la base de datos. Si no se especifica un rol durante el payload, el sistema asigna el perfil base de "Coleccionista" por defecto.
- `POST /api/v1/auth/login`: Realiza la verificación de credenciales contra la base de datos de Supabase y retorna un payload con el nombre, correo y el perfil de acceso del usuario para gestionar la sesión del lado del cliente.

### Interfaz Condicional en React
El frontend implementa una UI de transición sobria (Dark Theme nativo), alternando entre pantallas de inicio de sesión y registro de forma fluida. Una vez que el usuario se ha autenticado con éxito, la Interfaz de Usuario conmuta sus vistas dinámicamente según el Rol concedido:
- **Coleccionista:** Posee acceso de lectura al Dashboard maestro para analizar proyecciones financieras MSVP y registrar nuevas adquisiciones personales al catálogo.
- **Administrador:** Además de las funciones básicas, adquiere acceso a un panel de control exclusivo para visualizar, monitorear y auditar la tabla de Factores Externos que alimenta el motor matemático.

---

## 3. Credenciales Semilla (Entorno de Evaluación)

Para propósitos de auditoría y revisión académica de las funcionalidades RBAC, el script de inicialización (`seed.sql`) ha sembrado las siguientes cuentas oficiales de prueba en la base de datos. Estas credenciales permiten el acceso inmediato a las vistas segmentadas por perfil:

| Rol de Sistema | Correo de Acceso | Contraseña |
|----------------|-----------------|------------|
| **Administrador** | `admin@hotwheels.com` | `Admin123` |
| **Coleccionista** | `collector@hotwheels.com` | `Collector123` |

---

## 4. Stack Tecnológico

- **Backend:** C# / ASP.NET Core 8 Web API
- **Frontend:** React 19 / Vite 8 / Vanilla CSS (Dark Theme System)
- **Base de Datos:** PostgreSQL (Alojamiento en Supabase AWS)
- **ORM:** Entity Framework Core 8.0.4
- **Despliegue:** Docker Multi-stage Build (Kestrel sobre puerto 8080)

---

## 5. Instrucciones de Despliegue Local

Si deseas ejecutar el proyecto de forma local para pruebas de desarrollo, asegúrate de tener instalado **Docker** en tu máquina y ejecuta el siguiente comando en la raíz del monorepo:

```bash
docker build -t hotwheels-collector-core .
docker run -p 8080:8080 hotwheels-collector-core
```

El servidor unificado estará disponible en `http://localhost:8080`.
