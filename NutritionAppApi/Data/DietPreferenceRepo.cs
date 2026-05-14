using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class DietPreferenceRepo : IDietPreference
    {
        private readonly NutritionDbContext _context;
        public DietPreferenceRepo(NutritionDbContext context)
        {
            _context = context;
        }
        public async Task CreateAsync(DietPreference pref)
        {
            _context.DietPref.Add(pref);
            await _context.SaveChangesAsync();
        }

        public async Task<DietPreference?> GetByPreferenceIdAsync(int prefId)
        {
            return await _context.DietPref.FirstOrDefaultAsync(p => p.PreferenceId == prefId);
        }

        public async Task<DietPreference?> GetByUserIdAsync(int userId)
        {
            return await _context.DietPref.FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task UpdateAsync(DietPreference pref)
        { 
          _context.DietPref.Update(pref);
           await _context.SaveChangesAsync();
        }
    }
}