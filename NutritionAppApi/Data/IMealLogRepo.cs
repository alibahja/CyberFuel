using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IMealLogRepo
    {
        // Log a Meal
        Task<MealLog> CreateAsync(MealLog mealLog);
        
        // Get Daily Logs
        Task<List<MealLog>> GetDailyLogsAsync(int userId, DateTime date);
        
        // Edit Logged Meal
        Task<MealLog> UpdateAsync(MealLog mealLog);
        
        // Delete Logged Meal
        Task DeleteAsync(int mealLogId);
        
        // Get single log for editing
        Task<MealLog?> GetByIdAsync(int mealLogId);
    }
}