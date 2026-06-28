namespace backend.Services.Strategies;

/// <summary>
/// Resolutor de estrategias de crecimiento de mercado.
/// Recibe vía inyección de dependencias todas las implementaciones registradas
/// de IMarketGrowthStrategy y selecciona la correcta según la clave de rareza.
/// Elimina por completo cualquier bloque switch/if-else del flujo de simulación.
/// </summary>
public class MarketGrowthStrategyResolver
{
    private readonly Dictionary<string, IMarketGrowthStrategy> _estrategias;

    public MarketGrowthStrategyResolver(IEnumerable<IMarketGrowthStrategy> estrategias)
    {
        _estrategias = estrategias.ToDictionary(e => e.RarezaKey, e => e);
    }

    /// <summary>
    /// Resuelve la estrategia de crecimiento correspondiente a la rareza indicada.
    /// Si la rareza no tiene una estrategia registrada, retorna una tasa base de 0.
    /// </summary>
    public IMarketGrowthStrategy Resolver(string rareza)
    {
        return _estrategias.TryGetValue(rareza, out var estrategia)
            ? estrategia
            : new DefaultGrowthStrategy();
    }

    /// <summary>
    /// Estrategia interna de respaldo para rarezas no registradas.
    /// </summary>
    private class DefaultGrowthStrategy : IMarketGrowthStrategy
    {
        public string RarezaKey => "Default";
        public decimal ObtenerTasaBase() => 0.0m;
    }
}
