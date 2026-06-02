using System.Text.Json.Serialization;

namespace backend.Models;

public class Hotwheel
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public string Rareza { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public int UsuarioId { get; set; }

    [JsonIgnore]
    public virtual Category? Category { get; set; }

    [JsonIgnore]
    public virtual Projection? Projection { get; set; }

    [JsonIgnore]
    public virtual Usuario? Usuario { get; set; }
}
