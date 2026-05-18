using backend.Models;

namespace backend.Services;

public class MSVPService
{
    public Dictionary<int, decimal> CalcularProyecciones(Hotwheel hotwheel)
    {
        decimal tasaInteres = hotwheel.Rareza switch
        {
            "Mainline" => 0.05m,
            "STH" => 0.15m,
            "RLC" => 0.25m,
            _ => 0.0m
        };

        var proyecciones = new Dictionary<int, decimal>();
        int[] anios = { 1, 5, 10, 20 };

        foreach (var anio in anios)
        {
            // Fórmula de interés compuesto: A = P(1 + r)^t
            decimal proyeccion = hotwheel.PrecioBase * (decimal)Math.Pow((double)(1 + tasaInteres), anio);
            proyecciones.Add(anio, Math.Round(proyeccion, 2));
        }

        return proyecciones;
    }
}
