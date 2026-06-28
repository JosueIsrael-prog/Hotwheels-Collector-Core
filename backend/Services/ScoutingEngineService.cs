using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ScoutingEngineService : IScoutingEngineService
{
    private readonly ApplicationDbContext _context;

    public ScoutingEngineService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Hotwheel>> ObtenerModelosSimilaresAsync(Hotwheel objetivo, int cantidad = 3)
    {
        var candidatos = await _context.Hotwheels
            .Where(h => h.Id != objetivo.Id
                && h.UsuarioId == objetivo.UsuarioId
                && (h.CategoryId == objetivo.CategoryId || h.Rareza == objetivo.Rareza))
            .ToListAsync();

        int parseModelo(string modeloStr)
        {
            if (int.TryParse(modeloStr, out int anio))
                return anio;
            return 2000;
        }

        int objetivoAnio = parseModelo(objetivo.Modelo);
        decimal w1 = 0.7m;
        decimal w2 = 0.3m;

        var evaluados = candidatos.Select(c =>
        {
            int cAnio = parseModelo(c.Modelo);
            
            decimal deltaPrecio = c.PrecioBase - objetivo.PrecioBase;
            decimal deltaAnio = (decimal)(cAnio - objetivoAnio);

            double mpiCuadrado = (double)(w1 * (deltaPrecio * deltaPrecio) + w2 * (deltaAnio * deltaAnio));
            
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
