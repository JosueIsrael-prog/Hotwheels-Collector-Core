using backend.Data;
using backend.Models;
using backend.Services.Builder;
using backend.Services.Strategies;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// Fachada de alto nivel del Motor de Similitud y Valoración Proyectada (MSVP).
/// Orquesta internamente la resolución de estrategia, la carga de factores externos,
/// la construcción del contexto de simulación y la ejecución de los bucles anidados.
/// 
/// Patrones aplicados:
/// - Facade: Oculta la complejidad del subsistema MSVP tras un único método público.
/// - DIP: Depende exclusivamente de abstracciones inyectadas vía constructor.
/// 
/// La lógica matemática original del MSVP se preserva íntegramente:
/// - Bucle externo cronológico: interés compuesto con tasa basada en rareza.
/// - Bucle interno macroeconómico: acumulación de impacto de factores externos de Supabase.
/// - Tres escenarios de riesgo: Conservador (50%), Esperado (100%), Agresivo (150%).
/// </summary>
public class MsvpEngineFacade : IMsvpEngineFacade
{
    private readonly ApplicationDbContext _context;
    private readonly MarketGrowthStrategyResolver _strategyResolver;

    public MsvpEngineFacade(
        ApplicationDbContext context,
        MarketGrowthStrategyResolver strategyResolver)
    {
        _context = context;
        _strategyResolver = strategyResolver;
    }

    public async Task<List<ProyeccionAnual>> EjecutarProyeccionAsync(Hotwheel hotwheel)
    {
        // 1. Resolver la estrategia de crecimiento según la rareza del vehículo (Strategy Pattern)
        var estrategia = _strategyResolver.Resolver(hotwheel.Rareza);

        // 2. Cargar factores macroeconómicos activos desde Supabase
        var factoresExternos = await _context.FactoresExternos.ToListAsync();

        // 3. Construir el contexto de simulación dinámicamente (Builder Pattern)
        var contexto = new SimulationContextBuilder()
            .ConPrecioBase(hotwheel.PrecioBase)
            .ConEstrategia(estrategia)
            .ConHorizonteTemporal(new[] { 1, 5, 10, 20 })
            .ConFactoresExternos(factoresExternos)
            .Build();

        // 4. Ejecutar el motor de simulación con bucles anidados
        return EjecutarSimulacion(contexto);
    }

    /// <summary>
    /// Ejecuta la simulación financiera mediante bucles anidados.
    /// Bucle externo: itera sobre el horizonte temporal aplicando interés compuesto.
    /// Bucle interno: itera sobre los factores macroeconómicos acumulando impacto.
    /// </summary>
    private List<ProyeccionAnual> EjecutarSimulacion(SimulationContext contexto)
    {
        var resultados = new List<ProyeccionAnual>();

        // Bucle externo cronológico: cada intervalo temporal del horizonte
        foreach (var anio in contexto.HorizonteTemporal)
        {
            decimal valorCompuesto = contexto.PrecioBase
                * (decimal)Math.Pow((double)(1 + contexto.TasaCrecimiento), anio);

            decimal acumuladoConservador = 0m;
            decimal acumuladoEsperado = 0m;
            decimal acumuladoAgresivo = 0m;

            var detalleConservador = new List<DetalleFactorImpacto>();
            var detalleEsperado = new List<DetalleFactorImpacto>();
            var detalleAgresivo = new List<DetalleFactorImpacto>();

            // Bucle interno macroeconómico: cada factor externo de Supabase
            foreach (var factor in contexto.FactoresExternos)
            {
                // Conservador: impacto reducido al 50%
                decimal incrementoConservador = valorCompuesto * factor.ImpactoPorcentaje * 0.5m;
                acumuladoConservador += incrementoConservador;
                detalleConservador.Add(new DetalleFactorImpacto
                {
                    NombreFactor = factor.NombreFactor,
                    Porcentaje = factor.ImpactoPorcentaje * 0.5m,
                    IncrementoAbsoluto = Math.Round(incrementoConservador, 2)
                });

                // Esperado: impacto base (100%)
                decimal incrementoEsperado = valorCompuesto * factor.ImpactoPorcentaje;
                acumuladoEsperado += incrementoEsperado;
                detalleEsperado.Add(new DetalleFactorImpacto
                {
                    NombreFactor = factor.NombreFactor,
                    Porcentaje = factor.ImpactoPorcentaje,
                    IncrementoAbsoluto = Math.Round(incrementoEsperado, 2)
                });

                // Agresivo: impacto potenciado al 150%
                decimal incrementoAgresivo = valorCompuesto * factor.ImpactoPorcentaje * 1.5m;
                acumuladoAgresivo += incrementoAgresivo;
                detalleAgresivo.Add(new DetalleFactorImpacto
                {
                    NombreFactor = factor.NombreFactor,
                    Porcentaje = factor.ImpactoPorcentaje * 1.5m,
                    IncrementoAbsoluto = Math.Round(incrementoAgresivo, 2)
                });
            }

            resultados.Add(new ProyeccionAnual
            {
                Anio = anio,
                ValorBase = Math.Round(valorCompuesto, 2),
                EscenarioConservador = CrearEscenario(contexto.PrecioBase, valorCompuesto, acumuladoConservador, detalleConservador),
                EscenarioEsperado = CrearEscenario(contexto.PrecioBase, valorCompuesto, acumuladoEsperado, detalleEsperado),
                EscenarioAgresivo = CrearEscenario(contexto.PrecioBase, valorCompuesto, acumuladoAgresivo, detalleAgresivo)
            });
        }

        return resultados;
    }

    /// <summary>
    /// Construye un escenario de proyección individual con los valores finales calculados.
    /// </summary>
    private EscenarioProyeccion CrearEscenario(
        decimal precioInicial,
        decimal valorCompuesto,
        decimal acumuladoFactores,
        List<DetalleFactorImpacto> factores)
    {
        decimal valorFinal = Math.Round(valorCompuesto + acumuladoFactores, 2);
        decimal multiplicador = precioInicial > 0
            ? Math.Round(valorFinal / precioInicial, 2)
            : 0;

        return new EscenarioProyeccion
        {
            AjusteFactores = Math.Round(acumuladoFactores, 2),
            ValorFinal = valorFinal,
            Multiplicador = multiplicador,
            Factores = factores
        };
    }
}
