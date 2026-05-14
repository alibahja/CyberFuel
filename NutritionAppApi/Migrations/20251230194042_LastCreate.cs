using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutritionAppApi.Migrations
{
    /// <inheritdoc />
    public partial class LastCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BudgetLevel",
                table: "Meals",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DietArchitecture",
                table: "Meals",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BudgetLevel",
                table: "Meals");

            migrationBuilder.DropColumn(
                name: "DietArchitecture",
                table: "Meals");
        }
    }
}
