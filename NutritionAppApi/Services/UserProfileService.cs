using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserProfileRepo _profileRepo;

        public UserProfileService(IUserProfileRepo profileRepo)
        {
            _profileRepo = profileRepo;
        }

        public async Task<ProfileResponseDto> GetProfileAsync(int userId)
        {
            var profile = await _profileRepo.GetByUserIdAsync(userId);
            if (profile == null)
                throw new Exception("Profile not found");

            return MapToResponse(profile);
        }

        public async Task<ProfileResponseDto> CreateAsync(ProfileRequestDto request, int userId)
        {
            var existingProfile = await _profileRepo.GetByUserIdAsync(userId);
            if (existingProfile != null)
                throw new Exception("Profile already exists");

            // Calculate daily calorie target if not provided
            float dailyCalorieTarget = request.DailyCalorieTarget ?? CalculateDailyCalories(request);

            var profile = new UserProfile
            {
                UserId = userId,
                Age = request.Age,
                Height = request.Height,
                Weight = request.Weight,
                TargetWeight = request.TargetWeight,
                Gender = request.Gender,
                GoalType = request.GoalType,
                ActivityLevel = request.ActivityLevel,
                DailyCalorieTarget = dailyCalorieTarget,
                CreatedAt = DateTime.UtcNow
            };

            await _profileRepo.CreateAsync(profile);

            return MapToResponse(profile);
        }

        public async Task<ProfileResponseDto> UpdateAsync(ProfileRequestDto request, int userId)
        {
            var profile = await _profileRepo.GetByUserIdAsync(userId);
            if (profile == null)
                throw new Exception("Profile not found");

            // Calculate daily calorie target if not provided
            float dailyCalorieTarget = request.DailyCalorieTarget ?? CalculateDailyCalories(request);

            profile.Age = request.Age;
            profile.Height = request.Height;
            profile.Weight = request.Weight;
            profile.TargetWeight = request.TargetWeight;
            profile.Gender = request.Gender;
            profile.GoalType = request.GoalType;
            profile.ActivityLevel = request.ActivityLevel;
            profile.DailyCalorieTarget = dailyCalorieTarget;
            profile.UpdatedAt = DateTime.UtcNow;

            await _profileRepo.UpdateAsync(profile);

            return MapToResponse(profile);
        }

        // Calculate daily calories using Mifflin-St Jeor Equation
        private static float CalculateDailyCalories(ProfileRequestDto request)
        {
            // Calculate BMR
            float bmr;
            
            if (request.Gender?.ToLower() == "male")
            {
                bmr = (10 * request.Weight) + (6.25f * request.Height) - (5 * request.Age) + 5;
            }
            else
            {
                bmr = (10 * request.Weight) + (6.25f * request.Height) - (5 * request.Age) - 161;
            }
            
            // Apply activity multiplier
            float activityMultiplier = request.ActivityLevel.ToLower() switch
            {
                "sedentary" => 1.2f,
                "light" => 1.375f,
                "moderate" => 1.55f,
                "active" => 1.725f,
                "veryactive" => 1.9f,
                _ => 1.2f
            };
            
            float maintenanceCalories = bmr * activityMultiplier;
            
            // Apply goal adjustment based on goal type
            float goalAdjustment = 1.0f;
            
            if (request.GoalType.ToLower() == "lose")
            {
                // For weight loss: 500-1000 calorie deficit per day (0.5-1kg per week)
                // Use a moderate deficit of 20% or 500 calories, whichever is smaller
                goalAdjustment = Math.Min(0.8f, 1.0f - (500f / maintenanceCalories));
            }
            else if (request.GoalType.ToLower() == "gain")
            {
                // For weight gain: 300-500 calorie surplus per day
                // Use a moderate surplus of 15% or 500 calories, whichever is smaller
                goalAdjustment = Math.Min(1.15f, 1.0f + (500f / maintenanceCalories));
            }
            // For "maintain", goalAdjustment stays at 1.0
            
            return maintenanceCalories * goalAdjustment;
        }

        // Calculate macro targets based on calories and weight
        private static (float protein, float carbs, float fats) CalculateMacros(float calories, float weight, string activityLevel)
        {
            // Protein: 1g per kg body weight (or 0.8g for sedentary)
            float proteinMultiplier = activityLevel.ToLower() == "sedentary" ? 0.8f : 1.0f;
            float proteinTarget = weight * proteinMultiplier;
            
            // Remaining calories after protein (protein = 4 cal/g)
            float proteinCalories = proteinTarget * 4;
            float remainingCalories = calories - proteinCalories;
            
            // Carbs: 45-65% of remaining calories (using 50%)
            float carbsCalories = remainingCalories * 0.5f;
            float carbsTarget = carbsCalories / 4; // carbs = 4 cal/g
            
            // Fats: 25-35% of remaining calories (using 30%)
            float fatsCalories = remainingCalories * 0.3f;
            float fatsTarget = fatsCalories / 9; // fats = 9 cal/g
            
            return (proteinTarget, carbsTarget, fatsTarget);
        }

        private static ProfileResponseDto MapToResponse(UserProfile profile)
        {
            var (protein, carbs, fats) = CalculateMacros(profile.DailyCalorieTarget, profile.Weight, profile.ActivityLevel);
            
            return new ProfileResponseDto
            {
                Age = profile.Age,
                Height = profile.Height,
                Weight = profile.Weight,
                TargetWeight = profile.TargetWeight,
                Gender = profile.Gender,
                GoalType = profile.GoalType,
                ActivityLevel = profile.ActivityLevel,
                DailyCalorieTarget = profile.DailyCalorieTarget,
                DailyProteinTarget = protein,
                DailyCarbsTarget = carbs,
                DailyFatsTarget = fats,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt
            };
        }
    }
}

