using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class MealLogRepo : IMealLogRepo
    {
        private readonly NutritionDbContext _context;

        public MealLogRepo(NutritionDbContext context)
        {
            _context = context;
        }

        public async Task<MealLog> CreateAsync(MealLog mealLog)
        {
            _context.LoggedMeals.Add(mealLog);
            await _context.SaveChangesAsync();
            return mealLog;
        }

        public async Task DeleteAsync(int mealLogId)
        {
            var meal = await _context.LoggedMeals
                .Include(l => l.Meal)
                .FirstOrDefaultAsync(p => p.MealLogId == mealLogId);

            if (meal != null)
            {
                _context.LoggedMeals.Remove(meal);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<MealLog?> GetByIdAsync(int mealLogId)
        {
            return await _context.LoggedMeals
                .Include(l => l.Meal)
                .FirstOrDefaultAsync(p => p.MealLogId == mealLogId);
        }

        public async Task<List<MealLog>> GetDailyLogsAsync(int userId, DateTime date)
        {
            return await _context.LoggedMeals
                .Include(l => l.Meal)
                .Where(p => p.UserId == userId && p.Date.Date == date.Date)
                .OrderBy(p => p.Time)
                .ToListAsync();
        }

        public async Task<MealLog> UpdateAsync(MealLog mealLog)
        {
            _context.LoggedMeals.Update(mealLog);
            await _context.SaveChangesAsync();
            return mealLog;
        }
    }
}