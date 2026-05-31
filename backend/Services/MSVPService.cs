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
            decimal acumuladoFactores = 0m;
            var detalleFactores = new List<DetalleFactorImpacto>();

            foreach (var factor in factores)
            {
                decimal incremento = valorCompuesto * factor.ImpactoPorcentaje;
                acumuladoFactores += incremento;

                detalleFactores.Add(new DetalleFactorImpacto
                {
                    NombreFactor = factor.NombreFactor,
                    Porcentaje = factor.ImpactoPorcentaje,
                    IncrementoAbsoluto = Math.Round(incremento, 2)
                });
            }

            decimal valorFinal = Math.Round(valorCompuesto + acumuladoFactores, 2);
            decimal multiplicador = hotwheel.PrecioBase > 0 ? Math.Round(valorFinal / hotwheel.PrecioBase, 2) : 0;

            resultados.Add(new ProyeccionAnual
            {
                Anio = anio,
                ValorBase = Math.Round(valorCompuesto, 2),
                AjusteFactores = Math.Round(acumuladoFactores, 2),
                ValorFinal = valorFinal,
                Multiplicador = multiplicador,
                Factores = detalleFactores
            });
        }

        return resultados;
    }
}

public class ProyeccionAnual
{
    public int Anio { get; set; }
    public decimal ValorBase { get; set; }
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
