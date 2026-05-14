using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IMealRepo
    {
        Task<IEnumerable<Meal>> GetMealsByTypeAsync(MealType mealType);
        Task<IEnumerable<Meal>> GetAllAsync();
        Task<Meal?> GetByIdAsync(int mealId);
        Task CreateAsync(Meal meal);
        Task UpdateAsync(Meal meal);
        Task DeleteAsync(int mealId);
    }
}