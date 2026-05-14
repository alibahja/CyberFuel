using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public enum DietType
    {
        None,
        Vegetarian,
        Vegan,
        GlutenFree,
        DairyFree,
        Keto,
        Paleo,
        Mediterranean
    }

    public enum BudgetLevel
    {
        Low,
        Medium,
        High
    }

    public class DietPreference
    {
        [Key]
        public int PreferenceId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        public DietType DietType { get; set; }

        [MaxLength(500)]
        public string Allergies { get; set; } = string.Empty; // Comma-separated: "Peanuts,Dairy,Shellfish"

        [MaxLength(500)]
        public string ExcludedFoods { get; set; } = string.Empty; // Comma-separated: "Broccoli,Mushrooms,Olives"

        [Required]
        public BudgetLevel BudgetLevel { get; set; }
    }
}