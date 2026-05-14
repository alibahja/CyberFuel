using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class UserSettingsService : IUserSettingsService
    {
        private readonly IUserSettingsRepo _settingsRepo;

        public UserSettingsService(IUserSettingsRepo settingsRepo)
        {
            _settingsRepo = settingsRepo;
        }

        public async Task<SettingsResponseDto> GetSettingsAsync(int userId)
        {
            var settings = await _settingsRepo.GetByUserIdAsync(userId);
            
            // Create default settings if none exist
            if (settings == null)
                return await CreateDefaultSettingsAsync(userId);

            return MapToResponse(settings);
        }

        public async Task<SettingsResponseDto> UpdateSettingsAsync(int userId, SettingsRequestDto request)
        {
            var settings = await _settingsRepo.GetByUserIdAsync(userId);
            
            if (settings == null)
            {
                // Create new settings if none exist
                settings = new UserSettings
                {
                    UserId = userId,
                    PreferredUnits = request.PreferredUnits,
                    DailyCalorieReminder = request.DailyCalorieReminder,
                    MealReminderEnabled = request.MealReminderEnabled,
                    DarkMode = request.DarkMode,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _settingsRepo.CreateAsync(settings);
            }
            else
            {
                // Update existing settings
                settings.PreferredUnits = request.PreferredUnits;
                settings.DailyCalorieReminder = request.DailyCalorieReminder;
                settings.MealReminderEnabled = request.MealReminderEnabled;
                settings.DarkMode = request.DarkMode;
                settings.UpdatedAt = DateTime.UtcNow;
                
                await _settingsRepo.UpdateAsync(settings);
            }

            return MapToResponse(settings);
        }

        public async Task<SettingsResponseDto> CreateDefaultSettingsAsync(int userId)
        {
            var defaultSettings = new UserSettings
            {
                UserId = userId,
                PreferredUnits = UnitSystem.Metric,
                DailyCalorieReminder = true,
                MealReminderEnabled = true,
                DarkMode = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _settingsRepo.CreateAsync(defaultSettings);
            return MapToResponse(defaultSettings);
        }

        private static SettingsResponseDto MapToResponse(UserSettings settings)
        {
            return new SettingsResponseDto
            {
                SettingsId = settings.SettingsId,
                PreferredUnits = settings.PreferredUnits,
                DailyCalorieReminder = settings.DailyCalorieReminder,
                MealReminderEnabled = settings.MealReminderEnabled,
                DarkMode = settings.DarkMode,
                CreatedAt = settings.CreatedAt,
                UpdatedAt = settings.UpdatedAt
            };
        }
    }
}