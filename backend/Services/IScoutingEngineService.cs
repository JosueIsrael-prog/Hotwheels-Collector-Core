using backend.Models;

namespace backend.Services;

/// <summary>
/// Abstracción del servicio de motor de scouting para búsqueda de modelos similares.
/// Principio aplicado: DIP — El controlador depende de esta abstracción,
/// no de la implementación concreta ScoutingEngineService.
/// </summary>
public interface IScoutingEngineService
{
    /// <summary>
    /// Obtiene los modelos más similares al vehículo objetivo según el índice MPI
    /// (Metric of Proximity Index) basado en distancia ponderada.
    /// </summary>
    Task<List<Hotwheel>> ObtenerModelosSimilaresAsync(Hotwheel objetivo, int cantidad = 3);
}
