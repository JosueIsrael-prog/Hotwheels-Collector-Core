using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ScoutingEngineService
{
    private readonly ApplicationDbContext _context;

    public ScoutingEngineService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Hotwheel>> ObtenerModelosSimilaresAsync(Hotwheel objetivo, int cantidad = 3)
    {
        var candidatos = await _context.Hotwheels
            .Where(h => h.Id != objetivo.Id && (h.CategoryId == objetivo.CategoryId || h.Rareza == objetivo.Rareza))
            .ToListAsync();

        int parseModelo(string modeloStr)
        {
            if (int.TryParse(modeloStr, out int anio))
                return anio;
            return 2000; // Valor por defecto si no es parseable
        }

        int objetivoAnio = parseModelo(objetivo.Modelo);
        decimal w1 = 0.7m; // Peso Precio
        decimal w2 = 0.3m; // Peso Año Modelo

        var evaluados = candidatos.Select(c =>
        {
            int cAnio = parseModelo(c.Modelo);
            
            // Deltas
            decimal deltaPrecio = c.PrecioBase - objetivo.PrecioBase;
            decimal deltaAnio = (decimal)(cAnio - objetivoAnio);

            // Suma de deltas al cuadrado ponderados
            double mpiCuadrado = (double)(w1 * (deltaPrecio * deltaPrecio) + w2 * (deltaAnio * deltaAnio));
            
            // Índice de Proximidad de Mercado (MPI)
            double mpi = Math.Sqrt(mpiCuadrado);

            return new { Vehiculo = c, Score = mpi };
        });

        return evaluados
            .OrderBy(e => e.Score)
            .Take(cantidad)
            .Select(e => e.Vehiculo)
            .ToList();
    }
}
