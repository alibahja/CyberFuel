using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class WeightLog
    {
        [Key]
        public int WeightLogId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [Range(30, 300)] // Reasonable weight range in kg (approx 66-661 lbs)
        public float Weight { get; set; } // in kilograms

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow.Date; // Default to today's date

        // Optional: Additional tracking
        public string? Notes { get; set; } =string.Empty;// "After workout", "Morning weight", etc.
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Optional: Body measurements (for advanced features)
        public float? BodyFatPercentage { get; set; }
        
        public float? MuscleMass { get; set; } // in kg
        
        public float? WaistCircumference { get; set; } // in cm

    
    }
}