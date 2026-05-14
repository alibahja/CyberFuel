using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class MealPlanRepo : IMealPlanRepo
    {
        private readonly NutritionDbContext _context;

        public MealPlanRepo(NutritionDbContext context)
        {
            _context = context;
        }

        public async Task<MealPlan> CreateAsync(MealPlan mealPlan)
        {
            _context.MealPlans.Add(mealPlan);
            await _context.SaveChangesAsync();
            return mealPlan;
        }

        public async Task DeleteAsync(int mealPlanId)
        {
            var mealPlan = await _context.MealPlans
                .FirstOrDefaultAsync(p => p.MealPlanId == mealPlanId);

            if (mealPlan != null)
            {
                _context.MealPlans.Remove(mealPlan);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(MealPlan mealPlan)
        {
            _context.MealPlans.Remove(mealPlan);
            await _context.SaveChangesAsync();
        }

        public async Task<MealPlan?> GetByIdAsync(int mealPlanId)
        {
            return await _context.MealPlans
                .FirstOrDefaultAsync(p => p.MealPlanId == mealPlanId);
        }

        public async Task<MealPlan?> GetByUserIdAndDateAsync(int userId, DateTime date)
        {
             return await _context.MealPlans
        .Include(p => p.MealPlanItems) // IMPORTANT: Include the items!
        .ThenInclude(m => m.Meal) // And include the meal details
        .FirstOrDefaultAsync(p => p.UserId == userId && p.Date == date);
        }

        public async Task<MealPlan?> GetByUserIdAsync(int userId)
        {
             return await _context.MealPlans
        .Include(p => p.MealPlanItems)
        .ThenInclude(m => m.Meal)
        .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task UpdateAsync(MealPlan mealPlan)
        {
            _context.MealPlans.Update(mealPlan);
            await _context.SaveChangesAsync();
        }
    }
}
