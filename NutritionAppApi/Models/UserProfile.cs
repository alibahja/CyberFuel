using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public class UserProfile
    {
        [Key]
        public int ProfileId { get; set; }
        
        [ForeignKey("User")]
        public int UserId { get; set; }
        
        [Required]
        [Range(1, 120)]
        public int Age { get; set; }

        [Required]
        [Range(50, 250)]
        public float Height { get; set; } // in cm

        [Required]
        [Range(30, 300)]
        public float Weight { get; set; } // in kg

        [Required]
        [Range(30, 300)]
        public float TargetWeight { get; set; } // in kg

        [MaxLength(50)]
        public string? Gender { get; set; } =string.Empty; // "Male", "Female", "Other", or null

        [Required]
        [MaxLength(50)]
        public string GoalType { get; set; } =string.Empty; // "Lose", "Maintain", "Gain"

        [Required]
        [MaxLength(50)]
        public string ActivityLevel { get; set; } =string.Empty; // "Sedentary", "Light", "Moderate", "Active", "VeryActive"

        [Required]
        [Range(1000, 5000)]
        public float DailyCalorieTarget { get; set; }

        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }

        
    }
}