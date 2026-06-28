using backend.Models;

namespace backend.Services.Builder;

/// <summary>
/// Modelo inmutable que encapsula la configuración completa de una simulación MSVP.
/// Construido exclusivamente por SimulationContextBuilder para garantizar
/// la correcta inicialización de todos los parámetros en tiempo de ejecución.
/// </summary>
public class SimulationContext
{
    /// <summary>
    /// Precio base del vehículo coleccionable (valor de entrada a la simulación).
    /// </summary>
    public decimal PrecioBase { get; }

    /// <summary>
    /// Tasa de crecimiento anual compuesto, determinada por la estrategia de rareza.
    /// </summary>
    public decimal TasaCrecimiento { get; }

    /// <summary>
    /// Intervalos de tiempo en años sobre los cuales se ejecuta la proyección.
    /// </summary>
    public int[] HorizonteTemporal { get; }

    /// <summary>
    /// Factores macroeconómicos activos cargados desde Supabase en tiempo real.
    /// </summary>
    public List<FactorExterno> FactoresExternos { get; }

    public SimulationContext(
        decimal precioBase,
        decimal tasaCrecimiento,
        int[] horizonteTemporal,
        List<FactorExterno> factoresExternos)
    {
        PrecioBase = precioBase;
        TasaCrecimiento = tasaCrecimiento;
        HorizonteTemporal = horizonteTemporal;
        FactoresExternos = factoresExternos;
    }
}
