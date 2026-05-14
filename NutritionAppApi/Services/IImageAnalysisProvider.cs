using NutritionAppApi.DTOs;

namespace NutritionAppApi.Interfaces
{
    public interface IImageAnalysisProvider
    {
        Task<ImageAnalysisResultDto> AnalyzeAsync(string imagePath);
    }
}
