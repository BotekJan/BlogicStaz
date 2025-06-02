using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseStructure1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Items");

            migrationBuilder.CreateTable(
                name: "Instituce",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazev = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Instituce", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazev = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Uzivatele",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Jmeno = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Prijmeni = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Telefon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DatumNarozeni = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InstituceId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Uzivatele", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Uzivatele_Instituce_InstituceId",
                        column: x => x.InstituceId,
                        principalTable: "Instituce",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Smlouvy",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nazev = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KlientId = table.Column<int>(type: "int", nullable: false),
                    SpravceId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Smlouvy", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Smlouvy_Uzivatele_KlientId",
                        column: x => x.KlientId,
                        principalTable: "Uzivatele",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Smlouvy_Uzivatele_SpravceId",
                        column: x => x.SpravceId,
                        principalTable: "Uzivatele",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UzivateleRole",
                columns: table => new
                {
                    UzivatelId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UzivateleRole", x => new { x.UzivatelId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_UzivateleRole_Role_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UzivateleRole_Uzivatele_UzivatelId",
                        column: x => x.UzivatelId,
                        principalTable: "Uzivatele",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PoradciSmlouvy",
                columns: table => new
                {
                    PoradceId = table.Column<int>(type: "int", nullable: false),
                    SmlouvaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PoradciSmlouvy", x => new { x.PoradceId, x.SmlouvaId });
                    table.ForeignKey(
                        name: "FK_PoradciSmlouvy_Smlouvy_SmlouvaId",
                        column: x => x.SmlouvaId,
                        principalTable: "Smlouvy",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PoradciSmlouvy_Uzivatele_PoradceId",
                        column: x => x.PoradceId,
                        principalTable: "Uzivatele",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PoradciSmlouvy_SmlouvaId",
                table: "PoradciSmlouvy",
                column: "SmlouvaId");

            migrationBuilder.CreateIndex(
                name: "IX_Smlouvy_KlientId",
                table: "Smlouvy",
                column: "KlientId");

            migrationBuilder.CreateIndex(
                name: "IX_Smlouvy_SpravceId",
                table: "Smlouvy",
                column: "SpravceId");

            migrationBuilder.CreateIndex(
                name: "IX_Uzivatele_InstituceId",
                table: "Uzivatele",
                column: "InstituceId");

            migrationBuilder.CreateIndex(
                name: "IX_UzivateleRole_RoleId",
                table: "UzivateleRole",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PoradciSmlouvy");

            migrationBuilder.DropTable(
                name: "UzivateleRole");

            migrationBuilder.DropTable(
                name: "Smlouvy");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "Uzivatele");

            migrationBuilder.DropTable(
                name: "Instituce");

            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                });
        }
    }
}
