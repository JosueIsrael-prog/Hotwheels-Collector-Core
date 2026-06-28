namespace backend.Services.Strategies;

/// <summary>
/// Abstracción Strategy que define el contrato de crecimiento de mercado
/// según la categoría de rareza de un vehículo coleccionable.
/// Principio aplicado: OCP — Agregar nuevas rarezas creando nuevas implementaciones,
/// sin modificar el motor de simulación existente.
/// </summary>
public interface IMarketGrowthStrategy
{
    /// <summary>
    /// Clave identificadora de la rareza asociada a esta estrategia.
    /// </summary>
    string RarezaKey { get; }

    /// <summary>
    /// Retorna la tasa base de crecimiento anual compuesto
    /// para la categoría de rareza del vehículo.
    /// </summary>
    decimal ObtenerTasaBase();
}
