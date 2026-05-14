using NutritionAppApi.DTOs;

namespace NutritionAppApi.Interfaces
{
    public interface IMealLogService
    {
        // Log a Meal
        Task<MealLogResponseDto> LogMealAsync(int userId, MealLogRequestDto request);
        
        // Get Daily Logs
        Task<List<MealLogResponseDto>> GetDailyLogsAsync(int userId, DateTime date);
        
        // Edit Logged Meal
        Task<MealLogResponseDto> UpdateMealLogAsync(int userId, int mealLogId, MealLogRequestDto request);
        
        // Delete Logged Meal
        Task DeleteMealLogAsync(int userId, int mealLogId);
    }
}