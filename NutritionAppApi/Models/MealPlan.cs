using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class MealPlan
    {
        [Key]
        public int MealPlanId { get; set; } // Changed from mealid to MealPlanId

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        public DateTime Date { get; set; } // Changed from string to DateTime

        [Required]
        [Range(0, 10000)]
        public float TotalCalories { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
        // A meal plan contains multiple meal items
        public virtual ICollection<MealPlanItem> MealPlanItems { get; set; } = new List<MealPlanItem>();
    }
}