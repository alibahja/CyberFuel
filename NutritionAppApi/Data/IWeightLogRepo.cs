using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IWeightLogRepo
    {
        // Log weight
        Task<WeightLog> CreateAsync(WeightLog weightLog);
        
        // Get weight history
        Task<List<WeightLog>> GetWeightHistoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        
        // Get latest weight
        Task<WeightLog?> GetLatestWeightAsync(int userId);
        
        // Get weight by date
        Task<WeightLog?> GetWeightByDateAsync(int userId, DateTime date);
        
        // Delete weight log
        Task DeleteAsync(int weightLogId);
        
        // Get single log
        Task<WeightLog?> GetByIdAsync(int weightLogId);
    }
}