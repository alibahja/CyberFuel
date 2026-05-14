using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NutritionAppApi.Models
{
    public enum UnitSystem
    {
        Metric,
        Imperial
    }

    public class UserSettings
    {
        [Key]
        public int SettingsId { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }

        [Required]
        public UnitSystem PreferredUnits { get; set; } = UnitSystem.Metric;

        [Required]
        public bool DailyCalorieReminder { get; set; } = true;

        [Required]
        public bool MealReminderEnabled { get; set; } = true;

        [Required]
        public bool DarkMode { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}