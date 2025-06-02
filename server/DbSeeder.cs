using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

public static class DbSeeder
{
    public static void SeedData(AppDbContext db)
    {
        var hasher = new PasswordHasher<object>();
        string hash = hasher.HashPassword(null, "Heslo123");

        // --- Roles ---
        if (!db.Role.Any())
        {
            db.Role.AddRange(
                new Role { Nazev = "klient" },
                new Role { Nazev = "zamestnanec" },
                new Role { Nazev = "admin" }
            );
            db.SaveChanges();
        }

        // --- Instituce ---
        if (!db.Instituce.Any())
        {
            db.Instituce.AddRange(
                new Instituce { Nazev = "ČSOB" },
                new Instituce { Nazev = "AEGON" },
                new Instituce { Nazev = "Axa" },
                new Instituce { Nazev = "Allianz" }
            );
            db.SaveChanges();
        }

        // --- Users ---
        if (!db.Uzivatele.Any())
        {
            db.Uzivatele.AddRange(
                // Klienti
                new Uzivatel { Jmeno = "Klient", Prijmeni = "Jedna", Email = "klient1@example.com", Telefon = "111111111", RodneCislo = "900101/0001", DatumNarozeni = new DateTime(1990, 1, 1), HesloHash = hash },
                new Uzivatel { Jmeno = "Klient", Prijmeni = "Dva", Email = "klient2@example.com", Telefon = "111111112", RodneCislo = "900202/0002", DatumNarozeni = new DateTime(1990, 2, 2), HesloHash = hash },
                new Uzivatel { Jmeno = "Klient", Prijmeni = "Tri", Email = "klient3@example.com", Telefon = "111111113", RodneCislo = "900303/0003", DatumNarozeni = new DateTime(1990, 3, 3), HesloHash = hash },
                new Uzivatel { Jmeno = "Klient", Prijmeni = "Ctyri", Email = "klient4@example.com", Telefon = "111111114", RodneCislo = "900404/0004", DatumNarozeni = new DateTime(1990, 4, 4), HesloHash = hash },
                // Zamestnanci
                new Uzivatel { Jmeno = "Zamestnanec", Prijmeni = "Jedna", Email = "zamestnanec1@example.com", Telefon = "222222221", RodneCislo = "850101/1001", DatumNarozeni = new DateTime(1985, 1, 1), HesloHash = hash },
                new Uzivatel { Jmeno = "Zamestnanec", Prijmeni = "Dva", Email = "zamestnanec2@example.com", Telefon = "222222222", RodneCislo = "850202/1002", DatumNarozeni = new DateTime(1985, 2, 2), HesloHash = hash },
                new Uzivatel { Jmeno = "Zamestnanec", Prijmeni = "Tri", Email = "zamestnanec3@example.com", Telefon = "222222223", RodneCislo = "850303/1003", DatumNarozeni = new DateTime(1985, 3, 3), HesloHash = hash },
                // Admin
                new Uzivatel { Jmeno = "Admin", Prijmeni = "Jedna", Email = "admin1@example.com", Telefon = "333333331", RodneCislo = "800101/2001", DatumNarozeni = new DateTime(1980, 1, 1), HesloHash = hash }
            );
            db.SaveChanges();
        }

        // --- User Roles ---
        if (!db.UzivateleRole.Any())
        {
            var users = db.Uzivatele.ToList();
            var roles = db.Role.ToList();
            // 0-3: klient, 4-6: zamestnanec, 7: admin
            db.UzivateleRole.AddRange(
                new UzivatelRole { UzivatelId = users[0].Id, RoleId = roles.First(r => r.Nazev == "klient").Id },
                new UzivatelRole { UzivatelId = users[1].Id, RoleId = roles.First(r => r.Nazev == "klient").Id },
                new UzivatelRole { UzivatelId = users[2].Id, RoleId = roles.First(r => r.Nazev == "klient").Id },
                new UzivatelRole { UzivatelId = users[3].Id, RoleId = roles.First(r => r.Nazev == "klient").Id },

                new UzivatelRole { UzivatelId = users[4].Id, RoleId = roles.First(r => r.Nazev == "zamestnanec").Id },
                new UzivatelRole { UzivatelId = users[5].Id, RoleId = roles.First(r => r.Nazev == "zamestnanec").Id },
                new UzivatelRole { UzivatelId = users[6].Id, RoleId = roles.First(r => r.Nazev == "zamestnanec").Id },

                new UzivatelRole { UzivatelId = users[7].Id, RoleId = roles.First(r => r.Nazev == "admin").Id }
            );
            db.SaveChanges();
        }

        // --- Contracts (Smlouvy) ---
        if (!db.Smlouvy.Any())
        {
            var users = db.Uzivatele.ToList();
            var instituce = db.Instituce.ToList();

            var smlouvy = new List<Smlouva>
            {
                new Smlouva {
                    EvidencniCislo = "2024001",
                    InstituceId = instituce[0].Id,
                    Nazev = "Smlouva Alpha",
                    KlientId = users[0].Id,
                    SpravceId = users[4].Id,
                    DatumUzavreni = new DateTime(2024, 1, 10),
                    DatumPlatnosti = new DateTime(2024, 1, 15),
                    DatumUkonceni = null
                },
                new Smlouva {
                    EvidencniCislo = "2024002",
                    InstituceId = instituce[1].Id,
                    Nazev = "Smlouva Beta",
                    KlientId = users[1].Id,
                    SpravceId = users[5].Id,
                    DatumUzavreni = new DateTime(2024, 2, 12),
                    DatumPlatnosti = new DateTime(2024, 2, 20),
                    DatumUkonceni = null
                },
                new Smlouva {
                    EvidencniCislo = "2024003",
                    InstituceId = instituce[2].Id,
                    Nazev = "Smlouva Gamma",
                    KlientId = users[2].Id,
                    SpravceId = users[6].Id,
                    DatumUzavreni = new DateTime(2024, 3, 5),
                    DatumPlatnosti = new DateTime(2024, 3, 10),
                    DatumUkonceni = null
                },
                new Smlouva {
                    EvidencniCislo = "2024004",
                    InstituceId = instituce[0].Id,
                    Nazev = "Smlouva Delta",
                    KlientId = users[3].Id,
                    SpravceId = users[4].Id,
                    DatumUzavreni = new DateTime(2024, 4, 7),
                    DatumPlatnosti = new DateTime(2024, 4, 10),
                    DatumUkonceni = null
                },
                new Smlouva {
                    EvidencniCislo = "2024005",
                    InstituceId = instituce[3].Id,
                    Nazev = "Smlouva Omega",
                    KlientId = users[1].Id,
                    SpravceId = users[7].Id,
                    DatumUzavreni = new DateTime(2024, 5, 1),
                    DatumPlatnosti = new DateTime(2024, 5, 10),
                    DatumUkonceni = null
                },
            };
            db.Smlouvy.AddRange(smlouvy);
            db.SaveChanges();
        }

        // --- PoradciSmlouvy ---
        if (!db.PoradciSmlouvy.Any())
        {
            var users = db.Uzivatele.ToList();
            var smlouvy = db.Smlouvy.ToList();

            db.PoradciSmlouvy.AddRange(
                new PoradceSmlouva { PoradceId = users[5].Id, SmlouvaId = smlouvy[0].Id }, // zamestnanec2 on Alpha
                new PoradceSmlouva { PoradceId = users[6].Id, SmlouvaId = smlouvy[0].Id }, // zamestnanec3 on Alpha

                new PoradceSmlouva { PoradceId = users[4].Id, SmlouvaId = smlouvy[1].Id }, // zamestnanec1 on Beta

                new PoradceSmlouva { PoradceId = users[5].Id, SmlouvaId = smlouvy[2].Id }, // zamestnanec2 on Gamma
                new PoradceSmlouva { PoradceId = users[7].Id, SmlouvaId = smlouvy[2].Id }, // admin on Gamma

                new PoradceSmlouva { PoradceId = users[4].Id, SmlouvaId = smlouvy[3].Id }, // zamestnanec1 on Delta
                new PoradceSmlouva { PoradceId = users[5].Id, SmlouvaId = smlouvy[4].Id }  // zamestnanec2 on Omega
            );
            db.SaveChanges();
        }
    }
}
