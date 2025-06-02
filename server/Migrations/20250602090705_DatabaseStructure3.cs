using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class DatabaseStructure3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RodneCislo",
                table: "Uzivatele",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DatumPlatnosti",
                table: "Smlouvy",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DatumUkonceni",
                table: "Smlouvy",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DatumUzavreni",
                table: "Smlouvy",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "EvidencniCislo",
                table: "Smlouvy",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "InstituceId",
                table: "Smlouvy",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Smlouvy_InstituceId",
                table: "Smlouvy",
                column: "InstituceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Smlouvy_Instituce_InstituceId",
                table: "Smlouvy",
                column: "InstituceId",
                principalTable: "Instituce",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Smlouvy_Instituce_InstituceId",
                table: "Smlouvy");

            migrationBuilder.DropIndex(
                name: "IX_Smlouvy_InstituceId",
                table: "Smlouvy");

            migrationBuilder.DropColumn(
                name: "RodneCislo",
                table: "Uzivatele");

            migrationBuilder.DropColumn(
                name: "DatumPlatnosti",
                table: "Smlouvy");

            migrationBuilder.DropColumn(
                name: "DatumUkonceni",
                table: "Smlouvy");

            migrationBuilder.DropColumn(
                name: "DatumUzavreni",
                table: "Smlouvy");

            migrationBuilder.DropColumn(
                name: "EvidencniCislo",
                table: "Smlouvy");

            migrationBuilder.DropColumn(
                name: "InstituceId",
                table: "Smlouvy");
        }
    }
}
