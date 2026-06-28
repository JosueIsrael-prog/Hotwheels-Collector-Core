namespace backend.Services.Strategies;

/// <summary>
/// Estrategia de crecimiento para vehículos de categoría Mainline.
/// Tasa de apreciación conservadora propia del segmento de producción masiva.
/// </summary>
public class MainlineGrowthStrategy : IMarketGrowthStrategy
{
    public string RarezaKey => "Mainline";

    public decimal ObtenerTasaBase() => 0.05m;
}
