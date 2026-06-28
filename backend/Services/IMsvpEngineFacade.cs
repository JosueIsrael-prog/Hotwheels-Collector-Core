using backend.Models;

namespace backend.Services;

/// <summary>
/// Abstracción de alto nivel del Motor de Similitud y Valoración Proyectada (MSVP).
/// Principio aplicado: DIP — El controlador depende de esta abstracción,
/// no de la implementación concreta del motor de simulación.
/// </summary>
public interface IMsvpEngineFacade
{
    /// <summary>
    /// Ejecuta la proyección financiera completa para un vehículo coleccionable,
    /// orquestando internamente la resolución de estrategia, la carga de factores
    /// macroeconómicos, la construcción del contexto y la simulación de bucles anidados.
    /// </summary>
    Task<List<ProyeccionAnual>> EjecutarProyeccionAsync(Hotwheel hotwheel);
}
