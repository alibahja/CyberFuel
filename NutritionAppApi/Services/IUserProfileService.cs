using NutritionAppApi.DTOs;
namespace NutritionAppApi.Services
{
    public interface IUserProfileService
    {
        Task<ProfileResponseDto> GetProfileAsync(int userid);

        Task<ProfileResponseDto> UpdateAsync(ProfileRequestDto request, int userId);

        Task<ProfileResponseDto> CreateAsync(ProfileRequestDto request, int userId);

    }
}