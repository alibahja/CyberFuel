using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class MealLog
    {
        [Key]
        public int MealLogId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [ForeignKey("Meal")]
        public int? MealId { get; set; }
        //added a meal name field 
        public string? MealName { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan Time { get; set; } // Changed from 'time' to 'TimeSpan'

        [Required]
        [Range(0, 5000)]
        public float LoggedCalories { get; set; }

        [Required]
        public bool IsFromAI { get; set; } // Changed from 'isfromai' to 'IsFromAI'

        // Optional: Store additional nutrition info at log time
        public float? LoggedProtein { get; set; }
        public float? LoggedCarbs { get; set; }
        public float? LoggedFats { get; set; }

        // Optional: If user adjusted portion from standard
        public float? PortionMultiplier { get; set; }
         // we add this meal field to the existing fields 
         public Meal? Meal { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        
    
    }
}