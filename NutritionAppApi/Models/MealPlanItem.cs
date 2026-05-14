using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public enum MealType
    {
        Breakfast,
        Lunch,
        Dinner,
        Snack
    }

    public class MealPlanItem
    {
        [Key]
        public int MealPlanItemId { get; set; }

        [ForeignKey(nameof(MealPlan))]
        public int MealPlanId { get; set; }

        public MealPlan MealPlan { get; set; } = null!;

        [ForeignKey(nameof(Meal))]
        public int MealId { get; set; }

        public Meal Meal { get; set; } = null!;

        [Required]
        public MealType MealType { get; set; }

        [Range(0.5f, 3f)]
        public float PortionMultiplier { get; set; } = 1.0f;

        public int Order { get; set; } = 0;

        // Option number (1, 2, or 3) to group meals into options per meal time
        public int OptionNumber { get; set; } = 1;
    }
}