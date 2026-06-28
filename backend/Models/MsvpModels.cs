namespace backend.Models;

/// <summary>
/// DTOs de respuesta del Motor de Similitud y Valoración Proyectada (MSVP).
/// Modelos de transferencia que estructuran los resultados de las proyecciones financieras.
/// </summary>

/// <summary>
/// Representa la proyección financiera completa para un intervalo temporal específico,
/// incluyendo los tres escenarios de riesgo calculados por el MSVP.
/// </summary>
public class ProyeccionAnual
{
    public int Anio { get; set; }
    public decimal ValorBase { get; set; }
    public EscenarioProyeccion EscenarioConservador { get; set; } = new();
    public EscenarioProyeccion EscenarioEsperado { get; set; } = new();
    public EscenarioProyeccion EscenarioAgresivo { get; set; } = new();
}

/// <summary>
/// Representa un escenario de riesgo individual con el valor final calculado,
/// el multiplicador de retorno y el desglose de impacto por factor externo.
/// </summary>
public class EscenarioProyeccion
{
    public decimal AjusteFactores { get; set; }
    public decimal ValorFinal { get; set; }
    public decimal Multiplicador { get; set; }
    public List<DetalleFactorImpacto> Factores { get; set; } = new();
}

/// <summary>
/// Detalle granular del impacto individual de cada factor macroeconómico
/// sobre el valor proyectado del vehículo en un escenario dado.
/// </summary>
public class DetalleFactorImpacto
{
    public string NombreFactor { get; set; } = string.Empty;
    public decimal Porcentaje { get; set; }
    public decimal IncrementoAbsoluto { get; set; }
}
