using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IUserSettingsRepo
    {
        // Get user settings
        Task<UserSettings?> GetByUserIdAsync(int userId);
        
        // Create settings (on first use)
        Task<UserSettings> CreateAsync(UserSettings settings);
        
        // Update settings
        Task<UserSettings> UpdateAsync(UserSettings settings);
        
        // Check if settings exist
        Task<bool> SettingsExistAsync(int userId);
    }
}