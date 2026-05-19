using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    [JsonIgnore]
    public virtual ICollection<Hotwheel> Hotwheels { get; set; } = new List<Hotwheel>();
}
