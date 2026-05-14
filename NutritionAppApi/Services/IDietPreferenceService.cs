using NutritionAppApi.DTOs;
namespace NutritionAppApi.Services
{
    public interface IDietPreferenceService
    {
        Task<PreferenceResponseDto> GetDietPref(int userid);

        Task<PreferenceResponseDto> CreateAsync(PreferenceRequestDto request, int userid);

        Task<PreferenceResponseDto> UpdateAsync(PreferenceRequestDto request, int userid);
    }
}