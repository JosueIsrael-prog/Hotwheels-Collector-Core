using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HotwheelsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly MSVPService _msvpService;

    public HotwheelsController(ApplicationDbContext context, MSVPService msvpService)
    {
        _context = context;
        _msvpService = msvpService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // NO HARDCODING: Obtenemos los datos dinámicamente de la base de datos
        var hotwheels = await _context.Hotwheels.ToListAsync();
        return Ok(hotwheels);
    }

    [HttpGet("{id}/analisis")]
    public async Task<IActionResult> GetAnalisis(int id)
    {
        // NO HARDCODING: Buscamos la pieza específica en PostgreSQL
        var hotwheel = await _context.Hotwheels.FindAsync(id);
        
        if (hotwheel == null)
        {
            return NotFound(new { message = "Hotwheel no encontrado en el catálogo maestro." });
        }

        // Pasamos el objeto por el motor algorítmico MSVPService
        var proyecciones = _msvpService.CalcularProyecciones(hotwheel);
        
        var resultado = new
        {
            Hotwheel = hotwheel,
            Proyecciones = proyecciones
        };

        return Ok(resultado);
    }
}
