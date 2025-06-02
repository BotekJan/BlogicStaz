using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

// Load .env variables (requires DotNetEnv NuGet package)
DotNetEnv.Env.Load();

// Get values from environment, or fallback to provided defaults:
string frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";

string dbServer = Environment.GetEnvironmentVariable("DB_SERVER") ?? "localhost";
string dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "1433";
string dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "BlogicStazBotek";
string dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "sa";
string dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "YourStrongPassword";
string seedDummyData = Environment.GetEnvironmentVariable("SEED_DUMMY_DATA") ?? "false";

// Build connection string from variables:
string connectionString =
    $"Server={dbServer},{dbPort};Database={dbName};User Id={dbUser};Password={dbPassword};TrustServerCertificate=True;";

// --- DI, EF a autentizace ---
var builder = WebApplication.CreateBuilder(args);



// Set up CORS to allow only the frontend URL
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(frontendUrl.Split(',')) // allows comma-separated list in env
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});




builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "CookieAuth";
        options.DefaultSignInScheme = "CookieAuth";
        options.DefaultAuthenticateScheme = "CookieAuth";
        options.DefaultChallengeScheme = "CookieAuth";
    })
    .AddCookie("CookieAuth", options =>
    {
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.Cookie.Name = "auth";
        options.Cookie.HttpOnly = true;
    });


builder.Services.AddAuthorization();


builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    // Only seed if the environment variable is "true"
    if (seedDummyData.ToLower() == "true")
    {
        DbSeeder.SeedData(db);
    }
}






// --- Migrace a seeding ---


// --- Endpointy ---

// Testovací endpoint – vrací všechny uživatele
app.MapGet("/", async (AppDbContext db) => await db.Uzivatele.ToListAsync());

// --- Autentizace a autorizace ---


app.MapPost("/register", async (AppDbContext db, HttpContext ctx, RegisterDto req) =>
{
    if (await db.Uzivatele.AnyAsync(u => u.Email == req.Email))
        return Results.BadRequest("Uživatel s tímto e-mailem už existuje.");

    var hasher = new PasswordHasher<object>();
    string hash = hasher.HashPassword(null, req.Heslo);

    var user = new Uzivatel
    {
        Jmeno = req.Jmeno,
        Prijmeni = req.Prijmeni,
        Email = req.Email,
        Telefon = req.Telefon,
        RodneCislo = req.RodneCislo,            // NOVÉ
        DatumNarozeni = req.DatumNarozeni,
        HesloHash = hash
    };

    db.Uzivatele.Add(user);
    await db.SaveChangesAsync();

    // Assign the 'klient' role
    var klientRole = await db.Role.FirstOrDefaultAsync(r => r.Nazev == "klient");
    if (klientRole == null)
        return Results.BadRequest("Role 'klient' nebyla nalezena v databázi.");

    db.UzivateleRole.Add(new UzivatelRole { UzivatelId = user.Id, RoleId = klientRole.Id });
    await db.SaveChangesAsync();

    // Reload roles for the new user
    var userWithRoles = await db.Uzivatele
        .Include(u => u.UzivateleRole)
        .ThenInclude(ur => ur.Role)
        .FirstAsync(u => u.Id == user.Id);

    // Sign in the user
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Jmeno + " " + user.Prijmeni),
        new Claim(ClaimTypes.Role, klientRole.Nazev)
    };

    var claimsIdentity = new ClaimsIdentity(claims, "CookieAuth");
    var authProps = new AuthenticationProperties { IsPersistent = true };

    await ctx.SignInAsync("CookieAuth", new ClaimsPrincipal(claimsIdentity), authProps);

    // Prepare object for frontend
    var userObj = new
    {
        id = user.Id,
        jmeno = user.Jmeno,
        prijmeni = user.Prijmeni,
        email = user.Email,
        telefon = user.Telefon,
        rodneCislo = user.RodneCislo,         // NOVÉ
        datumNarozeni = user.DatumNarozeni,
        roles = userWithRoles.UzivateleRole.Select(ur => ur.Role.Nazev).ToList()
    };

    return Results.Ok(userObj);
});

app.MapPost("/login", async (AppDbContext db, HttpContext ctx, LoginDto req) =>
{
    var user = await db.Uzivatele
        .Include(u => u.UzivateleRole)
        .ThenInclude(ur => ur.Role)
        .FirstOrDefaultAsync(u => u.Email == req.Email);

    if (user == null)
        return Results.BadRequest("Špatný e-mail nebo heslo.");

    var hasher = new PasswordHasher<object>();
    var result = hasher.VerifyHashedPassword(null, user.HesloHash, req.Heslo);

    if (result != PasswordVerificationResult.Success)
        return Results.BadRequest("Špatný e-mail nebo heslo.");

    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Jmeno + " " + user.Prijmeni)
    };

    // Add role claims
    foreach (var role in user.UzivateleRole.Select(ur => ur.Role.Nazev))
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    var claimsIdentity = new ClaimsIdentity(claims, "CookieAuth");
    var authProps = new AuthenticationProperties { IsPersistent = true };

    await ctx.SignInAsync("CookieAuth", new ClaimsPrincipal(claimsIdentity), authProps);

    // Return the user object (without password hash)
    var userObj = new
    {
        id = user.Id,
        jmeno = user.Jmeno,
        prijmeni = user.Prijmeni,
        email = user.Email,
        telefon = user.Telefon,
        datumNarozeni = user.DatumNarozeni,
        roles = user.UzivateleRole.Select(ur => ur.Role.Nazev).ToList()
    };

    return Results.Ok(userObj);
});

app.MapPost("/logout", async (HttpContext ctx) =>
{
    await ctx.SignOutAsync("CookieAuth");
    return Results.Ok("Odhlášení úspěšné.");
});

app.MapGet("/me", [Authorize] async (HttpContext ctx, AppDbContext db) =>
{
    var userIdStr = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdStr))
        return Results.Unauthorized();

    int userId = int.Parse(userIdStr);
    var user = await db.Uzivatele
        .Include(u => u.UzivateleRole)
        .ThenInclude(ur => ur.Role)
        .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null)
        return Results.NotFound();

    return Results.Ok(new
    {
        id = user.Id,
        jmeno = user.Jmeno,
        prijmeni = user.Prijmeni,
        email = user.Email,
        telefon = user.Telefon,
        datumNarozeni = user.DatumNarozeni,
        roles = user.UzivateleRole.Select(ur => ur.Role.Nazev).ToList()
    });
});

app.MapGet("/users", [Authorize] async (AppDbContext db) =>
{
    var users = await db.Uzivatele
        .Include(u => u.UzivateleRole)
        .ThenInclude(ur => ur.Role)
        .Select(u => new
        {
            id = u.Id,
            jmeno = u.Jmeno,
            prijmeni = u.Prijmeni,
            email = u.Email,
            roles = u.UzivateleRole.Select(ur => ur.Role.Nazev).ToList()
        }).ToListAsync();
    return Results.Ok(users);
});

app.MapGet("/users/{id:int}", [Authorize] async (int id, HttpContext ctx, AppDbContext db) =>
{
    var userIdStr = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdStr))
        return Results.Unauthorized();

    int currentUserId = int.Parse(userIdStr);
    // If you store roles as claims (e.g. on login), you can use IsInRole
    bool isAdmin = ctx.User.IsInRole("admin");

    // Only allow admin, or the user themselves
    

    var user = await db.Uzivatele.FindAsync(id);
    if (user == null)
        return Results.NotFound();

    // Optionally, don't return the password hash!
    return Results.Ok(new
    {
        user.Id,
        user.Jmeno,
        user.Prijmeni,
        user.Email,
        user.Telefon,
        user.DatumNarozeni
    });
});

app.MapPut("/users/{id:int}", [Authorize] async (
    int id,
    AppDbContext db,
    HttpContext ctx,
    UserUpdateDto dto
) =>
{
    var userIdStr = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();
    int userId = int.Parse(userIdStr);
    bool isAdmin = ctx.User.IsInRole("admin");
    if (!isAdmin && userId != id) return Results.Forbid();

    var user = await db.Uzivatele.FindAsync(id);
    if (user == null) return Results.NotFound();

    user.Email = dto.Email;
    user.Telefon = dto.Telefon;

    await db.SaveChangesAsync();
    return Results.Ok();
});

app.MapGet("/smlouvy", async (AppDbContext db) =>
{
    var smlouvy = await db.Smlouvy
        .Include(s => s.Klient)
        .Include(s => s.Spravce)
        .Include(s => s.Instituce)    // NOVÉ
        .Include(s => s.PoradciSmlouvy)
        .ThenInclude(ps => ps.Poradce)
        .Select(s => new
        {
            id = s.Id,
            evidencniCislo = s.EvidencniCislo,      // NOVÉ
            nazev = s.Nazev,
            instituce = new { s.Instituce.Id, s.Instituce.Nazev }, // NOVÉ
            klient = new { s.Klient.Id, s.Klient.Jmeno, s.Klient.Prijmeni },
            spravce = new { s.Spravce.Id, s.Spravce.Jmeno, s.Spravce.Prijmeni },
            datumUzavreni = s.DatumUzavreni,          // NOVÉ
            datumPlatnosti = s.DatumPlatnosti,        // NOVÉ
            datumUkonceni = s.DatumUkonceni,          // NOVÉ
            poradci = s.PoradciSmlouvy.Select(ps => new { ps.Poradce.Id, ps.Poradce.Jmeno, ps.Poradce.Prijmeni }).ToList()
        })
        .ToListAsync();
    return Results.Ok(smlouvy);
});

// GET /smlouvy/{id} - detail by id
app.MapGet("/smlouvy/{id:int}", async (AppDbContext db, int id) =>
{
    var smlouva = await db.Smlouvy
        .Include(s => s.Klient)
        .Include(s => s.Spravce)
        .Include(s => s.Instituce) // NEW!
        .Include(s => s.PoradciSmlouvy)
        .ThenInclude(ps => ps.Poradce)
        .Where(s => s.Id == id)
        .Select(s => new
        {
            id = s.Id,
            evidencniCislo = s.EvidencniCislo,
            nazev = s.Nazev,
            instituce = new { s.Instituce.Id, s.Instituce.Nazev },
            klient = new { s.Klient.Id, s.Klient.Jmeno, s.Klient.Prijmeni },
            spravce = new { s.Spravce.Id, s.Spravce.Jmeno, s.Spravce.Prijmeni },
            datumUzavreni = s.DatumUzavreni,
            datumPlatnosti = s.DatumPlatnosti,
            datumUkonceni = s.DatumUkonceni,
            poradci = s.PoradciSmlouvy.Select(ps => new { ps.Poradce.Id, ps.Poradce.Jmeno, ps.Poradce.Prijmeni }).ToList()
        })
        .FirstOrDefaultAsync();

    if (smlouva == null)
        return Results.NotFound();

    return Results.Ok(smlouva);
});

app.MapGet("/mycontracts/{userId:int}", async (int userId, AppDbContext db) =>
{
    // Smlouvy kde je klient
    var klientContracts = await db.Smlouvy
        .Where(s => s.KlientId == userId)
        .Select(s => new { s.Id, s.Nazev, s.EvidencniCislo })
        .ToListAsync();

    // Smlouvy kde je správce
    var spravceContracts = await db.Smlouvy
        .Where(s => s.SpravceId == userId)
        .Select(s => new { s.Id, s.Nazev, s.EvidencniCislo })
        .ToListAsync();

    // Smlouvy kde je poradce (m:n tabulka)
    var poradceContracts = await db.PoradciSmlouvy
        .Where(ps => ps.PoradceId == userId)
        .Select(ps => new { ps.Smlouva.Id, ps.Smlouva.Nazev, ps.Smlouva.EvidencniCislo })
        .ToListAsync();

    return Results.Ok(new
    {
        klient = klientContracts,
        spravce = spravceContracts,
        poradce = poradceContracts
    });
});

app.MapPost("/smlouvy", [Authorize] async (
    SmlouvaCreateDto dto,
    AppDbContext db,
    HttpContext ctx
) =>
{
    // ... role kontrola stejná

    // Validace klienta i instituce
    var klient = await db.Uzivatele.FindAsync(dto.KlientId);
    if (klient == null)
        return Results.BadRequest("Klient neexistuje.");

    var instit = await db.Instituce.FindAsync(dto.InstituceId);
    if (instit == null)
        return Results.BadRequest("Instituce neexistuje.");

    var smlouva = new Smlouva
    {
        EvidencniCislo = dto.EvidencniCislo,
        InstituceId = dto.InstituceId,
        Nazev = dto.Nazev,
        KlientId = dto.KlientId,
        SpravceId = dto.SpravceId,
        DatumUzavreni = dto.DatumUzavreni,
        DatumPlatnosti = dto.DatumPlatnosti,
        DatumUkonceni = dto.DatumUkonceni,
        PoradciSmlouvy = dto.PoradciIds.Distinct().Select(pid => new PoradceSmlouva
        {
            PoradceId = pid
        }).ToList()
    };

    db.Smlouvy.Add(smlouva);
    await db.SaveChangesAsync();

    return Results.Ok(new { id = smlouva.Id });
});

// UPDATE smlouvy
app.MapPut("/smlouvy/{id:int}", [Authorize] async (
    int id,
    SmlouvaUpdateDto dto,
    AppDbContext db,
    HttpContext ctx
) =>
{
    var smlouva = await db.Smlouvy
        .Include(s => s.PoradciSmlouvy)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (smlouva == null)
        return Results.NotFound("Smlouva nebyla nalezena.");

    var userIdStr = ctx.User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();
    int userId = int.Parse(userIdStr);

    bool isAdmin = ctx.User.IsInRole("admin");
    if (!isAdmin && smlouva.SpravceId != userId)
        return Results.Forbid();

    smlouva.EvidencniCislo = dto.EvidencniCislo;
    smlouva.InstituceId = dto.InstituceId;
    smlouva.Nazev = dto.Nazev;
    smlouva.KlientId = dto.KlientId;
    smlouva.SpravceId = dto.SpravceId;
    smlouva.DatumUzavreni = dto.DatumUzavreni;
    smlouva.DatumPlatnosti = dto.DatumPlatnosti;
    smlouva.DatumUkonceni = dto.DatumUkonceni;

    smlouva.PoradciSmlouvy.Clear();
    var filteredPoradciIds = dto.PoradciIds.Distinct().Where(pid => pid != dto.SpravceId);
    foreach (var poradceId in filteredPoradciIds)
    {
        smlouva.PoradciSmlouvy.Add(new PoradceSmlouva
        {
            PoradceId = poradceId,
            SmlouvaId = smlouva.Id
        });
    }

    await db.SaveChangesAsync();

    return Results.Ok("Smlouva byla upravena.");
});

// DELETE smlouvy
app.MapDelete("/smlouvy/{id:int}", [Authorize] async (
    int id,
    AppDbContext db,
    HttpContext ctx
) =>
{
    // Get logged-in user info
    var userIdStr = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

    bool isAdmin = ctx.User.IsInRole("admin");

    // Only admin can delete
    if (!isAdmin)
        return Results.Forbid();

    var smlouva = await db.Smlouvy
        .Include(s => s.PoradciSmlouvy)
        .FirstOrDefaultAsync(s => s.Id == id);

    if (smlouva == null)
        return Results.NotFound("Smlouva nebyla nalezena.");

    // Remove poradci links first (EF will cascade if set up, but this is safe)
    db.PoradciSmlouvy.RemoveRange(smlouva.PoradciSmlouvy);
    db.Smlouvy.Remove(smlouva);

    await db.SaveChangesAsync();

    return Results.Ok("Smlouva byla smazána.");
});

app.MapGet("/instituce", async (AppDbContext db) =>
{
    var instituce = await db.Instituce
        .Select(i => new { id = i.Id, nazev = i.Nazev })
        .ToListAsync();
    return Results.Ok(instituce);
});
// --- Middleware ---
app.UseAuthentication();
app.UseAuthorization();
app.UseCors();

app.Run();

// --- DTOs ---
public class RegisterDto
{
    public string Jmeno { get; set; } = "";
    public string Prijmeni { get; set; } = "";
    public string Email { get; set; } = "";
    public string Telefon { get; set; } = "";
    public string RodneCislo { get; set; } = "";    // NOVÉ POLE
    public DateTime DatumNarozeni { get; set; }
    public string Heslo { get; set; } = "";
}

public class LoginDto
{
    public string Email { get; set; } = "";
    public string Heslo { get; set; } = "";
}

public class SmlouvaCreateDto
{
    public string EvidencniCislo { get; set; } = "";    // NOVÉ POLE
    public int InstituceId { get; set; }                // NOVÉ POLE
    public string Nazev { get; set; } = "";
    public int KlientId { get; set; }
    public int SpravceId { get; set; }                  // NOVÉ POLE (zavádíme pro konzistenci)
    public DateTime DatumUzavreni { get; set; }         // NOVÉ POLE
    public DateTime DatumPlatnosti { get; set; }        // NOVÉ POLE
    public DateTime? DatumUkonceni { get; set; }        // NOVÉ POLE (nullable)
    public List<int> PoradciIds { get; set; } = new();
}
public class SmlouvaUpdateDto : SmlouvaCreateDto
{
    // Stejná pole jako create DTO (může být i samostatná, když bude potřeba)
}

public class UserUpdateDto
{
    public string Email { get; set; } = "";
    public string Telefon { get; set; } = "";
    public string RodneCislo { get; set; } = "";    // NOVÉ POLE
}