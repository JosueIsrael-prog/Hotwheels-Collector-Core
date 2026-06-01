using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class MSVPService
{
    private readonly ApplicationDbContext _context;

    public MSVPService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProyeccionAnual>> CalcularProyeccionesAsync(Hotwheel hotwheel)
    {
        decimal tasaBase = hotwheel.Rareza switch
        {
            "Mainline" => 0.05m,
            "STH" => 0.15m,
            "RLC" => 0.25m,
            _ => 0.0m
        };

        var factores = await _context.FactoresExternos.ToListAsync();
        int[] anios = { 1, 5, 10, 20 };
        var resultados = new List<ProyeccionAnual>();

        foreach (var anio in anios)
        {
            decimal valorCompuesto = hotwheel.PrecioBase * (decimal)Math.Pow((double)(1 + tasaBase), anio);
            
            decimal acumuladoConservador = 0m;
            decimal acumuladoEsperado = 0m;
            decimal acumuladoAgresivo = 0m;
            
            var detalleConservador = new List<DetalleFactorImpacto>();
            var detalleEsperado = new List<DetalleFactorImpacto>();
            var detalleAgresivo = new List<DetalleFactorImpacto>();

            foreach (var factor in factores)
            {
                // Conservador: impacto reducido al 50%
                decimal incrementoConservador = valorCompuesto * factor.ImpactoPorcentaje * 0.5m;
                acumuladoConservador += incrementoConservador;
                detalleConservador.Add(new DetalleFactorImpacto { NombreFactor = factor.NombreFactor, Porcentaje = factor.ImpactoPorcentaje * 0.5m, IncrementoAbsoluto = Math.Round(incrementoConservador, 2) });

                // Esperado: impacto base (100%)
                decimal incrementoEsperado = valorCompuesto * factor.ImpactoPorcentaje;
                acumuladoEsperado += incrementoEsperado;
                detalleEsperado.Add(new DetalleFactorImpacto { NombreFactor = factor.NombreFactor, Porcentaje = factor.ImpactoPorcentaje, IncrementoAbsoluto = Math.Round(incrementoEsperado, 2) });

                // Agresivo: impacto potenciado al 150%
                decimal incrementoAgresivo = valorCompuesto * factor.ImpactoPorcentaje * 1.5m;
                acumuladoAgresivo += incrementoAgresivo;
                detalleAgresivo.Add(new DetalleFactorImpacto { NombreFactor = factor.NombreFactor, Porcentaje = factor.ImpactoPorcentaje * 1.5m, IncrementoAbsoluto = Math.Round(incrementoAgresivo, 2) });
            }

            resultados.Add(new ProyeccionAnual
            {
                Anio = anio,
                ValorBase = Math.Round(valorCompuesto, 2),
                EscenarioConservador = CrearEscenario(hotwheel.PrecioBase, valorCompuesto, acumuladoConservador, detalleConservador),
                EscenarioEsperado = CrearEscenario(hotwheel.PrecioBase, valorCompuesto, acumuladoEsperado, detalleEsperado),
                EscenarioAgresivo = CrearEscenario(hotwheel.PrecioBase, valorCompuesto, acumuladoAgresivo, detalleAgresivo)
            });
        }

        return resultados;
    }

    private EscenarioProyeccion CrearEscenario(decimal precioInicial, decimal valorCompuesto, decimal acumuladoFactores, List<DetalleFactorImpacto> factores)
    {
        decimal valorFinal = Math.Round(valorCompuesto + acumuladoFactores, 2);
        decimal multiplicador = precioInicial > 0 ? Math.Round(valorFinal / precioInicial, 2) : 0;

        return new EscenarioProyeccion
        {
            AjusteFactores = Math.Round(acumuladoFactores, 2),
            ValorFinal = valorFinal,
            Multiplicador = multiplicador,
            Factores = factores
        };
    }
}

public class ProyeccionAnual
{
    public int Anio { get; set; }
    public decimal ValorBase { get; set; }
    public EscenarioProyeccion EscenarioConservador { get; set; } = new();
    public EscenarioProyeccion EscenarioEsperado { get; set; } = new();
    public EscenarioProyeccion EscenarioAgresivo { get; set; } = new();
}

public class EscenarioProyeccion
{
    public decimal AjusteFactores { get; set; }
    public decimal ValorFinal { get; set; }
    public decimal Multiplicador { get; set; }
    public List<DetalleFactorImpacto> Factores { get; set; } = new();
}

public class DetalleFactorImpacto
{
    public string NombreFactor { get; set; } = string.Empty;
    public decimal Porcentaje { get; set; }
    public decimal IncrementoAbsoluto { get; set; }
}
