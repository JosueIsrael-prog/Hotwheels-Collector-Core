namespace backend.Services.Strategies;

/// <summary>
/// Estrategia de crecimiento para vehículos Red Line Club (RLC).
/// Tasa de apreciación agresiva propia de ediciones exclusivas de membresía.
/// </summary>
public class RlcGrowthStrategy : IMarketGrowthStrategy
{
    public string RarezaKey => "RLC";

    public decimal ObtenerTasaBase() => 0.25m;
}
