using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public enum SourceType
    {
        Manual,
        Planned,
        AI
    }

    public class Meal
    {
        [Key]
        public int MealId { get; set; }
        
        [Required]
        [MaxLength(256)]
        public string Name  { get; set; } =string.Empty;
         [Required]
         public MealType MealType { get; set; }

        [Required]
        public SourceType Source { get; set; }
        
        [Required]
        [Range(0, 5000)]
        public float Calories { get; set; }

        [Required]
        [Range(0, 500)]
        public float Protein { get; set; } // in grams

        [Required]
        [Range(0, 500)]
        public float Carbs { get; set; } // in grams

        [Required]
        [Range(0, 500)]
        public float Fats { get; set; } // in grams

        [Required]
        public DietType DietArchitecture { get; set; }

        [Required]
        public BudgetLevel BudgetLevel { get; set; }

        [Required]
        [Range(1, 10)]
        public int PortionSize { get; set; } // e.g., 1 = standard portion, 2 = double portion

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional: Store who created this meal (could be system or user)
        [ForeignKey("User")]
        public int? CreatedByUserId { get; set; }

    
    }
}