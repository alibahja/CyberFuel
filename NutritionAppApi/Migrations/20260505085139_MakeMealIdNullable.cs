using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutritionAppApi.Migrations
{
    /// <inheritdoc />
    public partial class MakeMealIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals");

            migrationBuilder.AlterColumn<int>(
                name: "MealId",
                table: "LoggedMeals",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "MealId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals");

            migrationBuilder.AlterColumn<int>(
                name: "MealId",
                table: "LoggedMeals",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_LoggedMeals_Meals_MealId",
                table: "LoggedMeals",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "MealId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
