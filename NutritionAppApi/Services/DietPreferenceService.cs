using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class DietPreferenceService : IDietPreferenceService
    {
        private readonly IDietPreference _dietrepo;

        public DietPreferenceService(IDietPreference dietrepo)
        {
            _dietrepo = dietrepo;
        }

        public async Task<PreferenceResponseDto> GetDietPref(int userId)
        {
            var preference = await _dietrepo.GetByUserIdAsync(userId);
            if (preference == null)
                throw new Exception("Diet preference not found");

            return MapToResponse(preference);
        }

        public async Task<PreferenceResponseDto> CreateAsync(PreferenceRequestDto request, int userId)
        {
            var existingPref = await _dietrepo.GetByUserIdAsync(userId);
            if (existingPref != null)
                throw new Exception("Diet Preference already exists");

            var diet_pref = new DietPreference
            {
                UserId = userId,
                DietType = request.DietType,
                Allergies = request.Allergies,
                ExcludedFoods = request.ExcludedFoods,
                BudgetLevel = request.BudgetLevel
            };

            await _dietrepo.CreateAsync(diet_pref);

            return MapToResponse(diet_pref);
        }

        public async Task<PreferenceResponseDto> UpdateAsync(PreferenceRequestDto request, int userId)
        {
            var preference = await _dietrepo.GetByUserIdAsync(userId);
            if (preference == null)
                throw new Exception("Diet preference not found");

            preference.DietType = request.DietType;
            preference.Allergies = request.Allergies;
            preference.ExcludedFoods = request.ExcludedFoods;
            preference.BudgetLevel = request.BudgetLevel;

            await _dietrepo.UpdateAsync(preference);

            return MapToResponse(preference);
        }

        private static PreferenceResponseDto MapToResponse(DietPreference pref)
        {
            return new PreferenceResponseDto
            {
                PreferenceId = pref.PreferenceId,
                DietType = pref.DietType,
                Allergies = pref.Allergies,
                ExcludedFoods = pref.ExcludedFoods,
                BudgetLevel = pref.BudgetLevel
            };
        }
    }
}