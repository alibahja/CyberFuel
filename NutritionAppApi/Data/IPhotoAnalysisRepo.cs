using NutritionAppApi.Models;

namespace NutritionAppApi.Data
{
    public interface IPhotoAnalysisRepo
    {
        Task<PhotoAnalysis> CreateAsync(PhotoAnalysis analysis);
        Task<PhotoAnalysis?> GetByIdAsync(int id);
        Task<PhotoAnalysis> UpdateAsync(PhotoAnalysis analysis);
        Task<List<PhotoAnalysis>> GetUserAnalysesAsync(int userId);
    }
}