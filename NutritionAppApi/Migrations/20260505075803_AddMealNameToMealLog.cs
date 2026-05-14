using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutritionAppApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMealNameToMealLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MealName",
                table: "LoggedMeals",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_LoggedMeals_MealId",
                table: "LoggedMeals",
                column: "MealId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "MealId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals");

            migrationBuilder.DropIndex(
                name: "IX_LoggedMeals_MealId",
                table: "LoggedMeals");

            migrationBuilder.DropColumn(
                name: "MealName",
                table: "LoggedMeals");
        }
    }
}
