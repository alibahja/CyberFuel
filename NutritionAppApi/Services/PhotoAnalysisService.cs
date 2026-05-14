using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class PhotoAnalysisService : IPhotoAnalysisService
    {
        private readonly IPhotoAnalysisRepo _photoRepo;
        private readonly IMealLogService _mealLogService;
        private readonly IImageAnalysisProvider _imageAnalysisProvider;

        public PhotoAnalysisService(
            IPhotoAnalysisRepo photoRepo,
            IMealLogService mealLogService,
            IImageAnalysisProvider imageAnalysisProvider)
        {
            _photoRepo = photoRepo;
            _mealLogService = mealLogService;
            _imageAnalysisProvider = imageAnalysisProvider;
        }

        public async Task<PhotoAnalyzeResponseDto> AnalyzeImageAsync(int userId, IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
                throw new Exception("Invalid image file");

            var tempFilePath = await SaveImageTempAsync(imageFile);
            var imageUrl = $"temp/{Path.GetFileName(tempFilePath)}";

            try
            {
                // 1️⃣ Analyze image using AI provider (Hugging Face)
                var aiResult = await _imageAnalysisProvider.AnalyzeAsync(tempFilePath);

                // 2️⃣ Save analysis
                var analysis = new PhotoAnalysis
                {
                      UserId = userId,
    ImageUrl = imageUrl,
    EstimatedCalories = aiResult.EstimatedCalories,
    // NEW: Save AI estimated macros
    EstimatedProtein = aiResult.EstimatedProtein,
    EstimatedCarbs = aiResult.EstimatedCarbs,
    EstimatedFats = aiResult.EstimatedFats,
    DetectedFoods = string.Join(", ", aiResult.DetectedFoods),
    ConfidenceLevel = aiResult.ConfidenceLevel,
    AIServiceUsed = aiResult.ProviderName,
    AnalysisRawResponse = aiResult.RawResponse,
    CreatedAt = DateTime.UtcNow,
    IsConfirmed = false
                };

                var savedAnalysis = await _photoRepo.CreateAsync(analysis);

                return MapToResponse(savedAnalysis);
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }
        }

        public async Task<PhotoAnalyzeResponseDto> ConfirmAnalysisAsync(int userId, ConfirmPhotoRequestDto request)
        {
            var analysis = await _photoRepo.GetByIdAsync(request.PhotoAnalysisId);

            if (analysis == null || analysis.UserId != userId)
                throw new Exception("Analysis not found or unauthorized");

            analysis.IsConfirmed = true;
            analysis.UserAdjustedCalories = request.AdjustedCalories;
            analysis.UserAdjustedProtein = request.AdjustedProtein;
            analysis.UserAdjustedCarbs = request.AdjustedCarbs;
            analysis.UserAdjustedFats = request.AdjustedFats;

            if (request.SaveAsMeal)
            {
                var mealLogRequest = new MealLogRequestDto
                {
                    MealId = 0,
                    Date = request.MealDate ?? DateTime.UtcNow.Date,
                    Time = request.MealTime ?? DateTime.UtcNow.TimeOfDay,
                    LoggedCalories = request.AdjustedCalories ?? analysis.EstimatedCalories,
                    LoggedProtein= request.AdjustedProtein ?? analysis.EstimatedProtein,
                    LoggedCarbs= request.AdjustedCarbs ?? analysis.EstimatedCarbs,
                    LoggedFats=request.AdjustedFats ?? analysis.EstimatedFats,
                    IsFromAI = true,
                    PortionMultiplier = 1.0f
                };

                var mealLog = await _mealLogService.LogMealAsync(userId, mealLogRequest);
                analysis.MealLogId = mealLog.MealLogId;
            }

            var updatedAnalysis = await _photoRepo.UpdateAsync(analysis);
            return MapToResponse(updatedAnalysis);
        }

        public async Task<PhotoAnalyzeResponseDto> GetAnalysisAsync(int userId, int analysisId)
        {
            var analysis = await _photoRepo.GetByIdAsync(analysisId);

            if (analysis == null || analysis.UserId != userId)
                throw new Exception("Analysis not found or unauthorized");

            return MapToResponse(analysis);
        }

        // ======================
        // Helper Methods
        // ======================

        private async Task<string> SaveImageTempAsync(IFormFile imageFile)
        {
            var tempPath = Path.GetTempPath();
            var fileName = $"{Guid.NewGuid()}_{imageFile.FileName}";
            var filePath = Path.Combine(tempPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await imageFile.CopyToAsync(stream);

            return filePath;
        }

        private PhotoAnalyzeResponseDto MapToResponse(PhotoAnalysis analysis)
        {
            return new PhotoAnalyzeResponseDto
            {
                PhotoAnalysisId = analysis.PhotoAnalysisId,
                EstimatedCalories = analysis.UserAdjustedCalories ?? analysis.EstimatedCalories,
                FinalProtein = analysis.UserAdjustedProtein ?? analysis.EstimatedProtein ?? 0,
                FinalCarbs = analysis.UserAdjustedCarbs ?? analysis.EstimatedCarbs ?? 0,
                FinalFats = analysis.UserAdjustedFats ?? analysis.EstimatedFats ?? 0,
                DetectedFoods = analysis.DetectedFoods,
                ConfidenceLevel = analysis.ConfidenceLevel,
                ImageUrl = analysis.ImageUrl,
                IsConfirmed = analysis.IsConfirmed,
                AIServiceUsed = analysis.AIServiceUsed,
                CreatedAt = analysis.CreatedAt,
                MealLogId = analysis.MealLogId
            };
        }
    }
}
