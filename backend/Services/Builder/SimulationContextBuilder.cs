using backend.Models;
using backend.Services.Strategies;

namespace backend.Services.Builder;

/// <summary>
/// Builder fluido para la construcción paso a paso del contexto de simulación MSVP.
/// Responsabilidad Única (SRP): configurar dinámicamente el escenario de simulación
/// inyectando valor base, estrategia de rareza, horizonte temporal y factores externos.
/// Garantiza que no existan constantes ni números quemados en el motor de cálculo.
/// </summary>
public class SimulationContextBuilder
{
    private decimal _precioBase;
    private decimal _tasaCrecimiento;
    private int[] _horizonteTemporal = { 1, 5, 10, 20 };
    private List<FactorExterno> _factoresExternos = new();

    /// <summary>
    /// Establece el precio base del vehículo para la simulación.
    /// </summary>
    public SimulationContextBuilder ConPrecioBase(decimal precioBase)
    {
        _precioBase = precioBase;
        return this;
    }

    /// <summary>
    /// Inyecta la estrategia de crecimiento de mercado y extrae su tasa base.
    /// </summary>
    public SimulationContextBuilder ConEstrategia(IMarketGrowthStrategy estrategia)
    {
        _tasaCrecimiento = estrategia.ObtenerTasaBase();
        return this;
    }

    /// <summary>
    /// Configura los intervalos de tiempo (en años) para la proyección cronológica.
    /// </summary>
    public SimulationContextBuilder ConHorizonteTemporal(int[] horizonteTemporal)
    {
        _horizonteTemporal = horizonteTemporal;
        return this;
    }

    /// <summary>
    /// Inyecta los factores macroeconómicos activos provenientes de Supabase.
    /// </summary>
    public SimulationContextBuilder ConFactoresExternos(List<FactorExterno> factoresExternos)
    {
        _factoresExternos = factoresExternos;
        return this;
    }

    /// <summary>
    /// Construye y retorna el contexto inmutable de simulación con todos los parámetros configurados.
    /// </summary>
    public SimulationContext Build()
    {
        return new SimulationContext(
            _precioBase,
            _tasaCrecimiento,
            _horizonteTemporal,
            _factoresExternos);
    }
}
