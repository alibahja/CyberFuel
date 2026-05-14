using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class MealLogService : IMealLogService
    {
        private readonly IMealLogRepo _logrepo;
        
        public MealLogService(IMealLogRepo logRepo)
        {
            _logrepo = logRepo;
        }

        public async Task<MealLogResponseDto> LogMealAsync(int userId, MealLogRequestDto request)
        {
            var mealLog = new MealLog
            {
                UserId = userId,
                MealId = request.MealId ?? 0,
                MealName = request.MealName,
                Date = request.Date.Date,
                Time = request.Time,
                LoggedCalories = request.LoggedCalories,
                IsFromAI = request.IsFromAI,
                LoggedProtein = request.LoggedProtein,
                LoggedCarbs = request.LoggedCarbs,
                LoggedFats = request.LoggedFats,
                PortionMultiplier = request.PortionMultiplier,
                CreatedAt = DateTime.UtcNow
            };

            var createdLog = await _logrepo.CreateAsync(mealLog);
            return MapToResponse(createdLog);
        }

        public async Task<List<MealLogResponseDto>> GetDailyLogsAsync(int userId, DateTime date)
        {
           Console.WriteLine($"Getting logs for UserId: {userId}, Date: {date}");
    
    var logs = await _logrepo.GetDailyLogsAsync(userId, date);
    Console.WriteLine($"Found {logs.Count} logs");
    
    return logs.Select(MapToResponse).ToList();
        }

        public async Task<MealLogResponseDto> UpdateMealLogAsync(int userId, int mealLogId, MealLogRequestDto request)
        {
            var existingLog = await _logrepo.GetByIdAsync(mealLogId);
            
            if (existingLog == null || existingLog.UserId != userId)
                throw new Exception("Meal log not found or unauthorized");

            existingLog.MealId = request.MealId;
            existingLog.Date = request.Date;
            existingLog.Time = request.Time;
            existingLog.LoggedCalories = request.LoggedCalories;
            existingLog.IsFromAI = request.IsFromAI;
            existingLog.LoggedProtein = request.LoggedProtein;
            existingLog.LoggedCarbs = request.LoggedCarbs;
            existingLog.LoggedFats = request.LoggedFats;
            existingLog.PortionMultiplier = request.PortionMultiplier;

            var updatedLog = await _logrepo.UpdateAsync(existingLog);
            return MapToResponse(updatedLog);
        }

        public async Task DeleteMealLogAsync(int userId, int mealLogId)
        {
            var existingLog = await _logrepo.GetByIdAsync(mealLogId);
            
            if (existingLog == null || existingLog.UserId != userId)
                throw new Exception("Meal log not found or unauthorized");

            await _logrepo.DeleteAsync(mealLogId);
        }

        private static MealLogResponseDto MapToResponse(MealLog log)
        {
            return new MealLogResponseDto
            {
                MealLogId = log.MealLogId,
                MealId = log.MealId,
                MealName = log.MealName ?? log.Meal?.Name ?? (log.IsFromAI ? "AI Scan" : "Manual Entry"),
                Date = log.Date,
                Time = log.Time,
                LoggedCalories = log.LoggedCalories,
                IsFromAI = log.IsFromAI,
                LoggedProtein = log.LoggedProtein,
                LoggedCarbs = log.LoggedCarbs,
                LoggedFats = log.LoggedFats,
                PortionMultiplier = log.PortionMultiplier,
                CreatedAt = log.CreatedAt
            };
        }
    }
}