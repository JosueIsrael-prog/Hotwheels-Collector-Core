using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class FactoresExternosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FactoresExternosController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var factores = await _context.FactoresExternos.ToListAsync();
        return Ok(factores);
    }
}
