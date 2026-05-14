using NutritionAppApi.Models;

namespace NutritionAppApi.DTOs
{
    public class MealDto
    {
        public int MealId { get; set; }
        public string Name { get; set; } = string.Empty;
        public SourceType Source { get; set; }
        public float Calories { get; set; }
        public float Protein { get; set; }
        public float Carbs { get; set; }
        public float Fats { get; set; }
        public int PortionSize { get; set; }
        public string MealType { get; set; } = string.Empty;
        public string DietArchitecture { get; set; } = string.Empty;
        public string BudgetLevel { get; set; } = string.Empty;
    }

    public class MealPlanItemDto
    {
        public int MealPlanItemId { get; set; }
        public string MealType { get; set; } = string.Empty;
        public MealDto Meal { get; set; } = new();
        public float PortionMultiplier { get; set; } = 1.0f;
        public int OptionNumber { get; set; } = 1;
    }

    public class MealPlanResponseDto
    {
        public int MealPlanId { get; set; }
        public DateTime Date { get; set; }
        public float TotalCalories { get; set; }
        public List<MealPlanItemDto> Meals { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}