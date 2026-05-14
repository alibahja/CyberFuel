using NutritionAppApi.DTOs;

namespace NutritionAppApi.Interfaces
{
    public interface IWeightLogService
    {
        // Get progress summary
        Task<ProgressSummaryDto> GetProgressSummaryAsync(int userId);
        
        // Log weight
        Task<WeightLogResponseDto> LogWeightAsync(int userId, WeightLogRequestDto request);
        
        // Get weight history
        Task<List<WeightLogResponseDto>> GetWeightHistoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        
        // Optional: Get single log
        Task<WeightLogResponseDto?> GetWeightLogAsync(int userId, int weightLogId);
        
        // Optional: Delete weight log
        Task DeleteWeightLogAsync(int userId, int weightLogId);
    }
}