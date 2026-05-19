namespace backend.Models;

public class Hotwheel
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public decimal PrecioBase { get; set; }
    public string Rareza { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public virtual Category Category { get; set; }

    public virtual Projection Projection { get; set; }
}
