using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseStructure2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Uzivatele_Instituce_InstituceId",
                table: "Uzivatele");

            migrationBuilder.DropIndex(
                name: "IX_Uzivatele_InstituceId",
                table: "Uzivatele");

            migrationBuilder.DropColumn(
                name: "InstituceId",
                table: "Uzivatele");

            migrationBuilder.AddColumn<string>(
                name: "HesloHash",
                table: "Uzivatele",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HesloHash",
                table: "Uzivatele");

            migrationBuilder.AddColumn<int>(
                name: "InstituceId",
                table: "Uzivatele",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Uzivatele_InstituceId",
                table: "Uzivatele",
                column: "InstituceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Uzivatele_Instituce_InstituceId",
                table: "Uzivatele",
                column: "InstituceId",
                principalTable: "Instituce",
                principalColumn: "Id");
        }
    }
}
