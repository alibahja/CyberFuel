using NutritionAppApi.DTOs;

namespace NutritionAppApi.Interfaces
{
    public interface IUserSettingsService
    {
        Task<SettingsResponseDto> GetSettingsAsync(int userId);
        Task<SettingsResponseDto> UpdateSettingsAsync(int userId, SettingsRequestDto request);
        Task<SettingsResponseDto> CreateDefaultSettingsAsync(int userId);
    }
}