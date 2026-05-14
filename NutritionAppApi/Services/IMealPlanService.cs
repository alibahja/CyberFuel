using NutritionAppApi.DTOs;

namespace NutritionAppApi.Services
{
    public interface IMealPlanService
    {
        Task<MealPlanResponseDto> GetMealPlanAsync(int userId);

        Task<MealPlanResponseDto> CreateMealPlanAsync(int userId);

        Task<MealPlanResponseDto> RegenerateMealPlanAsync(int userId);
    }
}
