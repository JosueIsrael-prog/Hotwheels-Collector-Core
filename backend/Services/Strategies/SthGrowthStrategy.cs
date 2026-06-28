namespace backend.Services.Strategies;

/// <summary>
/// Estrategia de crecimiento para vehículos Super Treasure Hunt (STH).
/// Tasa de apreciación moderada-alta propia de ediciones limitadas de caza.
/// </summary>
public class SthGrowthStrategy : IMarketGrowthStrategy
{
    public string RarezaKey => "STH";

    public decimal ObtenerTasaBase() => 0.15m;
}
