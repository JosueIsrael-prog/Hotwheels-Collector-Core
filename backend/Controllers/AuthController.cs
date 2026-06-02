using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

        if (usuario == null)
        {
            return Unauthorized(new { message = "Credenciales inválidas." });
        }

        return Ok(new
        {
            usuario.Id,
            usuario.Nombre,
            usuario.Email,
            usuario.Rol
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] Usuario nuevoUsuario)
    {
        var existente = await _context.Usuarios.AnyAsync(u => u.Email == nuevoUsuario.Email);

        if (existente)
        {
            return BadRequest(new { message = "El correo electrónico ya se encuentra registrado." });
        }

        if (string.IsNullOrWhiteSpace(nuevoUsuario.Rol))
        {
            nuevoUsuario.Rol = "Coleccionista";
        }

        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(Login), new { id = nuevoUsuario.Id }, new
        {
            nuevoUsuario.Id,
            nuevoUsuario.Nombre,
            nuevoUsuario.Email,
            nuevoUsuario.Rol
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
