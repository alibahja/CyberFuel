
namespace NutritionAppApi.DTOs
{
    public class SettingsRequestDto
    {
        public required Models.UnitSystem PreferredUnits { get; set; }
        public bool DailyCalorieReminder { get; set; } = true;
        public bool MealReminderEnabled { get; set; } = true;
        public bool DarkMode { get; set; } = false;
    }

    public class SettingsResponseDto
    {
        public int SettingsId { get; set; }
        public required Models.UnitSystem PreferredUnits { get; set; }
        public bool DailyCalorieReminder { get; set; }
        public bool MealReminderEnabled { get; set; }
        public bool DarkMode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

}