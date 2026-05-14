using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Interfaces;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class WeightLogService : IWeightLogService
    {
        private readonly IWeightLogRepo _logrepo;
        private readonly IUserProfileRepo _profilerepo; // Good call - update profile weight

        public WeightLogService(IWeightLogRepo logRepo, IUserProfileRepo profileRepo)
        {
            _logrepo = logRepo; 
            _profilerepo = profileRepo;
        }

        public async Task<WeightLogResponseDto> LogWeightAsync(int userId, WeightLogRequestDto request)
        {
            // Check if weight already logged for this date
            var existingLog = await _logrepo.GetWeightByDateAsync(userId, request.Date);
            if (existingLog != null)
                throw new Exception("Weight already logged for this date");

            var weightLog = new WeightLog
            {
                UserId = userId,
                Weight = request.Weight,
                Date = request.Date,
                Notes = request.Notes,
                BodyFatPercentage = request.BodyFatPercentage,
                MuscleMass = request.MuscleMass,
                WaistCircumference = request.WaistCircumference,
                CreatedAt = DateTime.UtcNow
            };
            var createdLog = await _logrepo.CreateAsync(weightLog);

            // ✅ Yes! Update user profile current weight
            await UpdateProfileWeightAsync(userId, request.Weight);

            return MapToResponse(createdLog);
        }

        public async Task<List<WeightLogResponseDto>> GetWeightHistoryAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var logs = await _logrepo.GetWeightHistoryAsync(userId, startDate, endDate);
            return logs.Select(MapToResponse).ToList();
        }

        public async Task<ProgressSummaryDto> GetProgressSummaryAsync(int userId)
        {
            var logs = await _logrepo.GetWeightHistoryAsync(userId);
            
            if (!logs.Any())
                return new ProgressSummaryDto();

            var currentWeight = logs.OrderByDescending(l => l.Date).First();
            var startingWeight = logs.OrderBy(l => l.Date).First();
            
            var totalChange = currentWeight.Weight - startingWeight.Weight;
            
            var daysBetween = (currentWeight.Date - startingWeight.Date).Days;
            var weeks = daysBetween > 0 ? daysBetween / 7.0 : 1;
            var averageWeeklyChange = totalChange / (float)weeks;

            var trend = averageWeeklyChange switch
            {
                < -0.5f => "Losing",
                > 0.5f => "Gaining",
                _ => "Maintaining"
            };

            var recentLogs = logs
                .OrderByDescending(l => l.Date)
                .Take(5)
                .Select(MapToResponse)
                .ToList();

            return new ProgressSummaryDto
            {
                CurrentWeight = MapToResponse(currentWeight),
                StartingWeight = MapToResponse(startingWeight),
                TotalChange = totalChange,
                AverageWeeklyChange = averageWeeklyChange,
                RecentLogs = recentLogs,
                Trend = trend
            };
        }

        public async Task<WeightLogResponseDto?> GetWeightLogAsync(int userId, int weightLogId)
        {
            var log = await _logrepo.GetByIdAsync(weightLogId);
            if (log == null || log.UserId != userId)
                return null;

            return MapToResponse(log);
        }

        public async Task DeleteWeightLogAsync(int userId, int weightLogId)
        {
            var log = await _logrepo.GetByIdAsync(weightLogId);
            if (log == null || log.UserId != userId)
                throw new Exception("Weight log not found or unauthorized");

            await _logrepo.DeleteAsync(weightLogId);
        }

        // ✅ Important: Update profile weight
        private async Task UpdateProfileWeightAsync(int userId, float newWeight)
        {
            var profile = await _profilerepo.GetByUserIdAsync(userId);
            if (profile != null)
            {
                profile.Weight = newWeight;
                profile.UpdatedAt = DateTime.UtcNow;
                await _profilerepo.UpdateAsync(profile);
            }
        }

        private static WeightLogResponseDto MapToResponse(WeightLog log)
        {
            return new WeightLogResponseDto
            {
                WeightLogId = log.WeightLogId,
                Weight = log.Weight,
                Date = log.Date,
                Notes = log.Notes,
                BodyFatPercentage = log.BodyFatPercentage,
                MuscleMass = log.MuscleMass,
                WaistCircumference = log.WaistCircumference,
                CreatedAt = log.CreatedAt
            };
        }
    }
}