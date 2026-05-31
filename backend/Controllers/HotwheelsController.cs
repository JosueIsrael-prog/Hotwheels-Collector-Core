using backend.Data;
using backend.Models;
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
        var hotwheels = await _context.Hotwheels.ToListAsync();
        return Ok(hotwheels);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Hotwheel hotwheel)
    {
        _context.Hotwheels.Add(hotwheel);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = hotwheel.Id }, hotwheel);
    }

    [HttpGet("{id}/analisis")]
    public async Task<IActionResult> GetAnalisis(int id)
    {
        var hotwheel = await _context.Hotwheels.FindAsync(id);

        if (hotwheel == null)
        {
            return NotFound(new { message = "Hotwheel no encontrado en el catálogo maestro." });
        }

        var proyecciones = await _msvpService.CalcularProyeccionesAsync(hotwheel);

        var modelosSimilares = await _context.Hotwheels
            .Where(h => h.Id != id && (h.CategoryId == hotwheel.CategoryId || h.Rareza == hotwheel.Rareza))
            .Take(3)
            .ToListAsync();

        var resultado = new
        {
            Hotwheel = hotwheel,
            Proyecciones = proyecciones,
            ModelosSimilares = modelosSimilares
        };

        return Ok(resultado);
    }
}
