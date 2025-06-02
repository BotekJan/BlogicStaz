using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Uzivatel> Uzivatele => Set<Uzivatel>();
    public DbSet<Role> Role => Set<Role>();
    public DbSet<Smlouva> Smlouvy => Set<Smlouva>();
    public DbSet<Instituce> Instituce => Set<Instituce>();
    public DbSet<UzivatelRole> UzivateleRole => Set<UzivatelRole>();
    public DbSet<PoradceSmlouva> PoradciSmlouvy => Set<PoradceSmlouva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Uzivatel <-> Role (m:n)
        modelBuilder.Entity<UzivatelRole>()
            .HasKey(ur => new { ur.UzivatelId, ur.RoleId });
        modelBuilder.Entity<UzivatelRole>()
            .HasOne(ur => ur.Uzivatel)
            .WithMany(u => u.UzivateleRole)
            .HasForeignKey(ur => ur.UzivatelId);
        modelBuilder.Entity<UzivatelRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UzivateleRole)
            .HasForeignKey(ur => ur.RoleId);

        // PoradciSmlouvy: m:n mezi Smlouva a Uzivatel (poradce)
        modelBuilder.Entity<PoradceSmlouva>()
            .HasKey(ps => new { ps.PoradceId, ps.SmlouvaId });
        modelBuilder.Entity<PoradceSmlouva>()
            .HasOne(ps => ps.Poradce)
            .WithMany(u => u.PoradciSmlouvy)
            .HasForeignKey(ps => ps.PoradceId);
        modelBuilder.Entity<PoradceSmlouva>()
            .HasOne(ps => ps.Smlouva)
            .WithMany(s => s.PoradciSmlouvy)
            .HasForeignKey(ps => ps.SmlouvaId);

        // Smlouva má jednoho klienta a jednoho správce (oba Uzivatel)
        modelBuilder.Entity<Smlouva>()
            .HasOne(s => s.Klient)
            .WithMany() // bez navigační vlastnosti v Uzivatel
            .HasForeignKey(s => s.KlientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Smlouva>()
            .HasOne(s => s.Spravce)
            .WithMany() // bez navigační vlastnosti v Uzivatel
            .HasForeignKey(s => s.SpravceId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Smlouva>()
            .HasOne(s => s.Instituce)
            .WithMany(i => i.Smlouvy)
            .HasForeignKey(s => s.InstituceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class Uzivatel
{
    public int Id { get; set; }
    public string Jmeno { get; set; } = "";
    public string Prijmeni { get; set; } = "";
    public string Email { get; set; } = "";
    public string Telefon { get; set; } = "";
    public string RodneCislo { get; set; } = "";      // NEW FIELD
    public DateTime DatumNarozeni { get; set; }
    public string HesloHash { get; set; } = "";
    public List<UzivatelRole> UzivateleRole { get; set; } = new();
    public List<PoradceSmlouva> PoradciSmlouvy { get; set; } = new();
}

public class Role
{
    public int Id { get; set; }
    public string Nazev { get; set; } = "";
    public List<UzivatelRole> UzivateleRole { get; set; } = new();
}

public class Smlouva
{
    public int Id { get; set; }
    public string EvidencniCislo { get; set; } = "";  // NEW FIELD
    public int InstituceId { get; set; }              // NEW FIELD
    public Instituce Instituce { get; set; } = null!; // NEW NAV PROPERTY
    public string Nazev { get; set; } = "";
    public int KlientId { get; set; }
    public Uzivatel Klient { get; set; } = null!;
    public int SpravceId { get; set; }
    public Uzivatel Spravce { get; set; } = null!;
    public DateTime DatumUzavreni { get; set; }       // NEW FIELD
    public DateTime DatumPlatnosti { get; set; }      // NEW FIELD
    public DateTime? DatumUkonceni { get; set; }      // NEW FIELD (nullable)
    public List<PoradceSmlouva> PoradciSmlouvy { get; set; } = new();
}

public class Instituce
{
    public int Id { get; set; }
    public string Nazev { get; set; } = "";
    public List<Smlouva> Smlouvy { get; set; } = new();
}

public class UzivatelRole
{
    public int UzivatelId { get; set; }
    public Uzivatel Uzivatel { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

public class PoradceSmlouva
{
    public int PoradceId { get; set; }
    public Uzivatel Poradce { get; set; } = null!;
    public int SmlouvaId { get; set; }
    public Smlouva Smlouva { get; set; } = null!;
}
