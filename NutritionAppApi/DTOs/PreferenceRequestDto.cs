using NutritionAppApi.Models;

namespace NutritionAppApi.DTOs
{
     public class PreferenceRequestDto
    {
        public  DietType DietType { get; set; }
        public string Allergies { get; set; } = string.Empty;
        public string ExcludedFoods { get; set; } = string.Empty;
        public required BudgetLevel BudgetLevel { get; set; }
    }

    public class PreferenceResponseDto
    {
        public int PreferenceId { get; set; }
        public DietType DietType { get; set; }
        public string Allergies { get; set; } = string.Empty;
        public string ExcludedFoods { get; set; } = string.Empty;
        public BudgetLevel BudgetLevel { get; set; }
    }
}