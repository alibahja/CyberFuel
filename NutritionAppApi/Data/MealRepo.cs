using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Data;
using NutritionAppApi.Models;

public class MealRepo : IMealRepo
{
    private readonly NutritionDbContext _context;

    public MealRepo(NutritionDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Meal>> GetMealsByTypeAsync(MealType mealType)
    {
        return await _context.Meals
            .Where(m => m.MealType == mealType)
            .ToListAsync();
    }

    // Implement other methods similarly...
    public async Task<Meal?> GetByIdAsync(int mealId)
    {
        return await _context.Meals.FindAsync(mealId);
    }

    public async Task<IEnumerable<Meal>> GetAllAsync()
    {
        return await _context.Meals.ToListAsync();
    }

    public async Task CreateAsync(Meal meal)
    {
        await _context.Meals.AddAsync(meal);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Meal meal)
    {
        _context.Meals.Update(meal);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int mealId)
    {
        var meal = await GetByIdAsync(mealId);
        if (meal != null)
        {
            _context.Meals.Remove(meal);
            await _context.SaveChangesAsync();
        }
    }
}