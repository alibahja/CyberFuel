using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IDietPreference
    {
         Task<DietPreference?> GetByUserIdAsync(int userId);
        Task<DietPreference?> GetByPreferenceIdAsync(int prefId);
        
        // Create/Update
        Task CreateAsync(DietPreference pref);
        Task UpdateAsync(DietPreference pref);
    }
}