using NutritionAppApi.DTOs;
namespace NutritionAppApi.Services
{
    public interface IPhotoAnalysisService
    {
        Task<PhotoAnalyzeResponseDto> AnalyzeImageAsync(int userId, IFormFile imageFile);
        Task<PhotoAnalyzeResponseDto> ConfirmAnalysisAsync(int userId, ConfirmPhotoRequestDto request);
        Task<PhotoAnalyzeResponseDto> GetAnalysisAsync(int userId, int analysisId);
    }
}