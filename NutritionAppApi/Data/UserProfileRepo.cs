using Microsoft.EntityFrameworkCore;
using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public class UserProfileRepo : IUserProfileRepo
    {
        private readonly NutritionDbContext _context;

        public UserProfileRepo(NutritionDbContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(UserProfile profile)
        {
            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        public async Task<UserProfile?> GetByProfileIdAsync(int profileId)
        {
            return await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.ProfileId == profileId);
        }

        public async Task<UserProfile?> GetByUserIdAsync(int userId)
        {
            return await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task UpdateAsync(UserProfile profile)
        {
            profile.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
