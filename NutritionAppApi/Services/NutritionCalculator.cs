using NutritionAppApi.Models;
namespace NutritionAppApi.Services
{

    public static class NutritionCalculator
    {
        public static NutritionTarget Calculate(UserProfile profile)
        {
            float bmr = profile.Gender?.ToLower() == "male"
                ? (10 * profile.Weight) + (6.25f * profile.Height) - (5 * profile.Age) + 5
                : (10 * profile.Weight) + (6.25f * profile.Height) - (5 * profile.Age) - 161;

            float activityMultiplier = profile.ActivityLevel.ToLower() switch
            {
                "sedentary" => 1.2f,
                "light" => 1.375f,
                "moderate" => 1.55f,
                "active" => 1.725f,
                "veryactive" => 1.9f,
                _ => 1.2f
            };

            float calories = bmr * activityMultiplier;

            calories *= profile.GoalType.ToLower() switch
            {
                "lose" => 0.85f,
                "gain" => 1.15f,
                _ => 1.0f
            };

            // Macros
            float protein = profile.Weight * 2.0f;
            float fats = profile.Weight * 0.9f;
            float remainingCalories = calories - (protein * 4) - (fats * 9);
            float carbs = remainingCalories / 4;

            return new NutritionTarget
            {
                Calories = calories,
                Protein = protein,
                Fats = fats,
                Carbs = carbs
            };
        }
    }
}
