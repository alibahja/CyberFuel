using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IMealPlanRepo
    {
        Task<MealPlan> CreateAsync(MealPlan mealPlan);

        Task<MealPlan?> GetByUserIdAsync(int userId);

        Task<MealPlan?> GetByIdAsync(int mealPlanId);

        Task UpdateAsync(MealPlan mealPlan);

        Task<MealPlan?> GetByUserIdAndDateAsync(int userId, DateTime date);

        Task DeleteAsync(MealPlan mealPlan); // Change from int to MealPlan
    }
}
