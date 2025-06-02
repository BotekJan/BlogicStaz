# BLOGIC CRM – Evidence smluv

Autor: Jan Botek

E-mail: jan.botek@seznam.cz

Moderní webová aplikace pro správu smluv mezi klienty, zaměstnanci a institucemi.  
Backend v .NET 8, frontend v Reactu, databáze MS SQL Server.

---

## Obsah

- [Požadavky](#požadavky)
- [Rychlý start (Docker Compose)](#rychlý-start-docker-compose)
- [Ruční spuštění bez Dockeru](#ruční-spuštění-bez-dockeru)
- [Uživatelská dokumentace](#uživatelská-dokumentace)
- [Technická dokumentace](#technická-dokumentace)
- [Testovací účty](#testovací-účty)

---

## Požadavky

- [Docker](https://www.docker.com/) & Docker Compose *(pro jednoduchý start)*
- Nebo:  
  - .NET 8 SDK  
  - Node.js 18+ & npm  
  - MS SQL Server 

---

## Rychlý start (Docker Compose)

1. **Naklonuj repozitář:**
    ```bash
    git clone https://github.com/tvoje-jmeno/blogic-crm.git
    cd blogic-crm
    ```

2. **Vytvoř .env soubory:**  
   - V adresáři `/server` vytvoř `.env` s údaji k databázi podle souboru .env.example, není zde potřeba nic měnit pokud to nevyžadujete:
     ```
     DB_SERVER=sqlserver
     DB_NAME=BlogicSmlouvy
     DB_USER=sa
     DB_PASSWORD=YourStrong!Passw0rd

     SEED_DUMMY_DATA=true
     #toto zajistí naplnění databáze daty pro testování aplikace
     ```
   - Pro frontend stejný postup v adresáři `/client`

        ```
        REACT_APP_API_URL=http://localhost:5000
        PORT=3000
        ```

3. **Spusť vše pomocí Docker Compose:**
    ```     bash
    docker-compose up --build
    ```
    - Backend poběží na `http://localhost:5000`
    - Frontend na `http://localhost:3000`
    - SQL Server dostupný na portu `1433`

---

## Ruční spuštění bez Dockeru

Po vytvoření `.env` souborů

1. **MS SQL Server**  
   Spusť lokálně nebo v Dockeru:
        ```bash
        docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
        ```

2. **Backend (.NET)**
    ```bash
    cd backend
    dotnet ef database update   # Vytvoření a migrace DB (první spuštění)
    dotnet run
    ```

3. **Frontend (React)**
    ```bash
    cd frontend
    npm install
    npm start
    ```

---

## Uživatelská dokumentace

- **Přihlášení/Registrace:**  
  Uživatelé se registrují a přihlašují přes webové rozhraní. Každý nově zaregistrovaný uživatel má roli klienta.
- **Role:**  
  - `klient` – běžný uživatel, může nahlížet na své smlouvy
  - `zamestnanec` – může spravovat své smlouvy a nahlížet na smlouvy u nichž je poradcem  
  - `admin` – má veškerá oprávnění, může také mazat smlouvy
  - každý uživatel může upravovat svůj profil
- **Smlouvy:**  
  Přehled všech smluv, kterých se přihlášený uživatel účastní s proklikem na detail smlouvy. Zaměstnanci mohou na této stránce přidávat nové smlouvy.
- **Správa smluv:**  
  Stránka na které může administrátor spravovat veškeré smlouvy

- **Detail smlouvy:**  
  Stránka zobrazující detail konkrétní smlouvy, správce smlouvy zde může smlouvu upravit, administrátor zde může smlouvu odstranit.

- **Uživatelé:**  
  Stránka na které může administrátor spravovat veškeré uživatele

- **Profil uživatele:**  
  Stránka na které může uživatel spravovat své údaje.

---

## Technická dokumentace

- **Backend (.NET 8, minimal API):**
  - Entity Framework Core (Code-first, migrace)
  - Autentizace přes cookie (ASP.NET Core Identity PasswordHasher)
  - Role a práva v DB (m:n tabulka mezi uživateli a rolemi)
  - Smlouvy mají navázané klienty, správce, poradce i instituci (vše přes cizí klíče)

- **Frontend (React, TypeScript, MUI):**
  - Axios pro komunikaci s API
  - Přihlášení, registrace, správa profilu
  - Tabulkové zobrazení smluv i uživatelů, detailní stránky
  - MUI Theme pro jednotný vzhled

- **Databáze:**
  - MS SQL Server (Docker i lokální instalace)
  - Tabulky: Uzivatele, Role, Smlouvy, Instituce, UzivateleRole, PoradciSmlouvy

- **Docker Compose:**
  - Služby: backend (.NET), frontend (React), db (MS SQL)

---

## Testovací účty



Po spuštění projektu jsou za předpokladu nastavení `SEED_DUMMY_DATA=true` automaticky vytvořeny následující testovací účty a s nimi spojené smlouvy a další testovací data:

| Role           | Jméno               | Email                    | Heslo    |
|----------------|---------------------|--------------------------|----------|
| **Admin**      | Admin Jedna         | admin1@example.com       | Heslo123 |
| **Zaměstnanec**| Zamestnanec Jedna   | zamestnanec1@example.com | Heslo123 |
| **Zaměstnanec**| Zamestnanec Dva     | zamestnanec2@example.com | Heslo123 |
| **Zaměstnanec**| Zamestnanec Tri     | zamestnanec3@example.com | Heslo123 |
| **Klient**     | Klient Jedna        | klient1@example.com      | Heslo123 |
| **Klient**     | Klient Dva          | klient2@example.com      | Heslo123 |
| **Klient**     | Klient Tri          | klient3@example.com      | Heslo123 |
| **Klient**     | Klient Ctyri        | klient4@example.com      | Heslo123 |

