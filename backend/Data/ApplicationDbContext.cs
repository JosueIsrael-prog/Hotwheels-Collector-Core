using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Hotwheel> Hotwheels { get; set; }
    public DbSet<Projection> Projections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Hotwheel>().ToTable("hotwheels");
        modelBuilder.Entity<Projection>().ToTable("proyecciones");

        // Configuration for 1-to-1 relationship between Hotwheel and Projection
        modelBuilder.Entity<Hotwheel>()
            .HasOne(h => h.Projection)
            .WithOne(p => p.Hotwheel)
            .HasForeignKey<Projection>(p => p.HotwheelId);
    }
}
