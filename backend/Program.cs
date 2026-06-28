using backend.Data;
using backend.Services;
using backend.Services.Strategies;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// --- Registro de Patrón Strategy: Estrategias de Crecimiento por Rareza ---
builder.Services.AddScoped<IMarketGrowthStrategy, MainlineGrowthStrategy>();
builder.Services.AddScoped<IMarketGrowthStrategy, SthGrowthStrategy>();
builder.Services.AddScoped<IMarketGrowthStrategy, RlcGrowthStrategy>();
builder.Services.AddScoped<MarketGrowthStrategyResolver>();

// --- Registro de Patrón Facade + DIP: Motor MSVP y Scouting ---
builder.Services.AddScoped<IMsvpEngineFacade, MsvpEngineFacade>();
builder.Services.AddScoped<IScoutingEngineService, ScoutingEngineService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
