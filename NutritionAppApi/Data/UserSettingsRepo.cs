using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class UserSettingsRepo : IUserSettingsRepo
    {
        private readonly NutritionDbContext _context;
        
        public UserSettingsRepo(NutritionDbContext context)
        {
            _context = context;
        }
        
        public async Task<UserSettings> CreateAsync(UserSettings settings)
        {
            _context.UserSettings.Add(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<UserSettings?> GetByUserIdAsync(int userId)
        {
            return await _context.UserSettings
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<bool> SettingsExistAsync(int userId)
        {
            return await _context.UserSettings
                .AnyAsync(s => s.UserId == userId);
        }

        public async Task<UserSettings> UpdateAsync(UserSettings settings)
        {
            settings.UpdatedAt = DateTime.UtcNow;
            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return settings;
        }
    }
}