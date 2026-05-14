using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class PhotoAnalysis
    {
        [Key]
        public int PhotoAnalysisId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } =string.Empty; // Changed from 'url' to 'string' with ImageUrl name

        [Required]
        [Range(0, 5000)]
        public float EstimatedCalories { get; set; }
        [Required]
        [Range(0,500)]
        public float? EstimatedProtein { get; set; } // in grams
        [Required]
        [Range(0,500)]
        public float? EstimatedCarbs { get; set; }   // in grams
        [Required]
        [Range(0,500)]
        public float? EstimatedFats { get; set; }    // in grams

        [Required]
        [MaxLength(1000)]
        public string DetectedFoods { get; set; } =string.Empty; // Changed from 'detectedfood' to 'DetectedFoods'

        [Required]
        [MaxLength(50)]
        public string ConfidenceLevel { get; set; } =string.Empty; // "High", "Medium", "Low" or percentage

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Additional useful properties
        public bool IsConfirmed { get; set; } = false; // Did user confirm the analysis?
        
        public float? UserAdjustedCalories { get; set; } // If user edited the estimate
         public float? UserAdjustedProtein { get; set; }
         public float? UserAdjustedCarbs { get; set; }
         public float? UserAdjustedFats { get; set; }
        
        public string AIServiceUsed { get; set; } = "OpenAI"; // Track which AI service was used
        
        public string AnalysisRawResponse { get; set; } =string.Empty; // Store raw AI response for debugging

        
        // Link to meal log if user saved this as a meal
        [ForeignKey("MealLog")]
        public int? MealLogId { get; set; }
        
      
    }
}