using NutritionAppApi.Data;
using NutritionAppApi.DTOs;
using NutritionAppApi.Models;

namespace NutritionAppApi.Services
{
    public class MealPlanService : IMealPlanService
    {
        private readonly IMealPlanRepo _mealPlanRepo;
        private readonly IUserProfileRepo _profileRepo;
        private readonly IDietPreference _preferenceRepo;
        private readonly IMealRepo _mealRepo;

        public MealPlanService(
            IMealPlanRepo mealPlanRepo,
            IUserProfileRepo profileRepo,
            IDietPreference preferenceRepo,
            IMealRepo mealRepo)
        {
            _mealPlanRepo = mealPlanRepo;
            _profileRepo = profileRepo;
            _preferenceRepo = preferenceRepo;
            _mealRepo = mealRepo;
        }

        /* =========================
           MAIN MEAL PLAN CREATION
           ========================= */

        public async Task<MealPlanResponseDto> CreateMealPlanAsync(int userId)
        {
            var profile = await _profileRepo.GetByUserIdAsync(userId)
                ?? throw new Exception("User profile not found");

            var preference = await _preferenceRepo.GetByUserIdAsync(userId);

            float targetCalories = profile.DailyCalorieTarget > 0
                ? profile.DailyCalorieTarget
                : CalculateDailyCalories(profile);

            var mealTypes = new List<(MealType Type, float Percentage)>
            {
                (MealType.Breakfast, 0.25f),
                (MealType.Lunch, 0.40f),
                (MealType.Dinner, 0.35f)
            };

            var mealPlanItems = new List<MealPlanItem>();
            int order = 0;

            // Get budget-based portion adjustment
            float budgetMultiplier = preference != null 
                ? GetBudgetMultiplier(preference.BudgetLevel) 
                : 1.0f;

            foreach (var (mealType, percentage) in mealTypes)
            {
                float mealTimeCalories = targetCalories * percentage;

                for (int option = 1; option <= 3; option++)
                {
                    float caloriesPerMeal = mealTimeCalories / 2f;

                    var meals = await SelectTwoDifferentMeals(mealType, preference);

                    foreach (var meal in meals)
                    {
                        float baseCalories = meal.Calories * meal.PortionSize;
                        // Apply budget multiplier to portion sizes
                        float multiplier = (caloriesPerMeal / baseCalories) * budgetMultiplier;
                        multiplier = Math.Clamp(multiplier, 0.5f, 2.5f);

                        mealPlanItems.Add(new MealPlanItem
                        {
                            MealType = mealType,
                            MealId = meal.MealId,
                            Meal = meal,
                            PortionMultiplier = multiplier,
                            OptionNumber = option,
                            Order = order++
                        });
                    }
                }
            }

            float totalCalories = mealPlanItems.Sum(m =>
                m.Meal.Calories * m.Meal.PortionSize * m.PortionMultiplier);

            var today = DateTime.UtcNow.Date;
            var existing = await _mealPlanRepo.GetByUserIdAndDateAsync(userId, today);
            if (existing != null)
                await _mealPlanRepo.DeleteAsync(existing);

            var mealPlan = new MealPlan
            {
                UserId = userId,
                Date = today,
                CreatedAt = DateTime.UtcNow,
                TotalCalories = totalCalories,
                MealPlanItems = mealPlanItems
            };

            await _mealPlanRepo.CreateAsync(mealPlan);
            return MapToResponse(mealPlan);
        }

        public async Task<MealPlanResponseDto> GetMealPlanAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var plan = await _mealPlanRepo.GetByUserIdAndDateAsync(userId, today);
            return plan == null ? await CreateMealPlanAsync(userId) : MapToResponse(plan);
        }

        public async Task<MealPlanResponseDto> RegenerateMealPlanAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var existing = await _mealPlanRepo.GetByUserIdAndDateAsync(userId, today);
            if (existing != null)
                await _mealPlanRepo.DeleteAsync(existing);

            return await CreateMealPlanAsync(userId);
        }

        /* =========================
           CALCULATION
           ========================= */

        private float CalculateDailyCalories(UserProfile profile)
        {
            float bmr = profile.Gender?.ToLower() == "male"
                ? (10 * profile.Weight) + (6.25f * profile.Height) - (5 * profile.Age) + 5
                : (10 * profile.Weight) + (6.25f * profile.Height) - (5 * profile.Age) - 161;

            float activity = profile.ActivityLevel.ToLower() switch
            {
                "sedentary" => 1.2f,
                "light" => 1.375f,
                "moderate" => 1.55f,
                "active" => 1.725f,
                "veryactive" => 1.9f,
                _ => 1.2f
            };

            float goal = profile.GoalType.ToLower() switch
            {
                "lose" => 0.85f,
                "gain" => 1.15f,
                _ => 1.0f
            };

            return bmr * activity * goal;
        }

        /* =========================
           BUDGET-BASED PORTION ADJUSTMENT
           ========================= */

        private float GetBudgetMultiplier(BudgetLevel budget)
        {
            return budget switch
            {
                BudgetLevel.Low => 0.8f,    // 20% smaller portions for low budget
                BudgetLevel.Medium => 1.0f,  // Standard portions for medium budget
                BudgetLevel.High => 1.3f,    // 30% larger portions for high budget
                _ => 1.0f
            };
        }

        /* =========================
           PREFERENCE FILTERING
           ========================= */

        private bool ContainsAllergens(Meal meal, string allergies)
        {
            if (string.IsNullOrWhiteSpace(allergies)) return false;

            return allergies.Split(',')
                .Any(a => meal.Name.Contains(a.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        private bool ContainsExcludedFoods(Meal meal, string excluded)
        {
            if (string.IsNullOrWhiteSpace(excluded)) return false;

            return excluded.Split(',')
                .Any(e => meal.Name.Contains(e.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        /* =========================
           MEAL SELECTION (WITH PREFERENCE FILTERING)
           ========================= */

        private async Task<List<Meal>> SelectTwoDifferentMeals(
            MealType type,
            DietPreference? pref)
        {
            var meals = await _mealRepo.GetMealsByTypeAsync(type);
            
            // If no preferences, return random meals
            if (pref == null)
                return meals.OrderBy(_ => Guid.NewGuid()).Take(2).ToList();

            // 1️⃣ STRICT filtering: exact diet type AND exact budget level
            var filtered = meals
                .Where(m =>
                    (pref.DietType == DietType.None || m.DietArchitecture == pref.DietType) &&
                    m.BudgetLevel == pref.BudgetLevel &&  // Must match exactly
                    !ContainsAllergens(m, pref.Allergies) &&
                    !ContainsExcludedFoods(m, pref.ExcludedFoods)
                )
                .ToList();

            // 2️⃣ Relax diet type (keep budget strict)
            if (filtered.Count < 2 && pref.DietType != DietType.None)
            {
                filtered = meals
                    .Where(m =>
                        m.BudgetLevel == pref.BudgetLevel &&
                        !ContainsAllergens(m, pref.Allergies) &&
                        !ContainsExcludedFoods(m, pref.ExcludedFoods)
                    )
                    .ToList();
            }

            // 3️⃣ Relax budget level (keep diet strict if specified)
            if (filtered.Count < 2)
            {
                filtered = meals
                    .Where(m =>
                        (pref.DietType == DietType.None || m.DietArchitecture == pref.DietType) &&
                        !ContainsAllergens(m, pref.Allergies) &&
                        !ContainsExcludedFoods(m, pref.ExcludedFoods)
                    )
                    .ToList();
            }

            // 4️⃣ Final fallback: just avoid allergens and exclusions
            if (filtered.Count < 2)
            {
                filtered = meals
                    .Where(m =>
                        !ContainsAllergens(m, pref.Allergies) &&
                        !ContainsExcludedFoods(m, pref.ExcludedFoods)
                    )
                    .ToList();
            }

            if (filtered.Count == 0)
                throw new Exception($"No safe meals available for {type}");

            // Return random unique meals (up to 2)
            return filtered
                .OrderBy(_ => Guid.NewGuid())
                .Take(Math.Min(2, filtered.Count))
                .ToList();
        }

        /* =========================
           RESPONSE MAPPING
           ========================= */

        private MealPlanResponseDto MapToResponse(MealPlan plan)
        {
            return new MealPlanResponseDto
            {
                MealPlanId = plan.MealPlanId,
                Date = plan.Date,
                CreatedAt = plan.CreatedAt,
                TotalCalories = plan.TotalCalories,
                Meals = plan.MealPlanItems.Select(m => new MealPlanItemDto
                {
                    MealPlanItemId = m.MealPlanItemId,
                    MealType = m.MealType.ToString(),
                    PortionMultiplier = m.PortionMultiplier,
                    OptionNumber = m.OptionNumber,
                    Meal = new MealDto
                    {
                        MealId = m.Meal.MealId,
                        Name = m.Meal.Name,
                        Source = m.Meal.Source,
                        Calories = m.Meal.Calories,
                        Protein = m.Meal.Protein,
                        Carbs = m.Meal.Carbs,
                        Fats = m.Meal.Fats,
                        PortionSize = m.Meal.PortionSize,
                        MealType = m.Meal.MealType.ToString(),
                        DietArchitecture = m.Meal.DietArchitecture.ToString(),
                        BudgetLevel = m.Meal.BudgetLevel.ToString()
                    }
                }).ToList()
            };
        }
    }
    // ❌ REMOVE THIS ENTIRE SECTION FROM THE BOTTOM OF THE FILE:
    // public interface IMealPlanService
    // {
    //     Task<MealPlanResponseDto> CreateMealPlanAsync(int userId);
    //     Task<MealPlanResponseDto> GetMealPlanAsync(int userId);
    //     Task<MealPlanResponseDto> RegenerateMealPlanAsync(int userId);
    // }
}