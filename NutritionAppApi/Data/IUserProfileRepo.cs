using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IUserProfileRepo
    {
         Task<UserProfile?> GetByUserIdAsync(int userId);
        Task<UserProfile?> GetByProfileIdAsync(int profileId);
        
        // Create/Update
        Task CreateAsync(UserProfile profile);
        Task UpdateAsync(UserProfile profile);
    }
}