namespace backend.Models;

public class Projection
{
    public int Id { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal Year1 { get; set; }
    public decimal Year5 { get; set; }
    public decimal Year10 { get; set; }
    public decimal Year20 { get; set; }
    
    public int HotwheelId { get; set; }
    public virtual Hotwheel? Hotwheel { get; set; }
}
