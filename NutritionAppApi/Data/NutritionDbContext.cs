using NutritionAppApi.Models;
using Microsoft.EntityFrameworkCore;

namespace NutritionAppApi.Data
{
    public class NutritionDbContext : DbContext
    {
        public NutritionDbContext(DbContextOptions<NutritionDbContext> opt) : base(opt)
        {

        }

        public DbSet<User> Users { get; set; }

        public DbSet<UserProfile> UserProfiles { get; set; }

        public DbSet<DietPreference> DietPref { get; set; }

        public DbSet<MealPlan> MealPlans { get; set; }

        public DbSet<MealLog> LoggedMeals { get; set; }

        public DbSet<PhotoAnalysis> PhotoAnalyses { get; set; }

        public DbSet<WeightLog> WeightLogs { get; set; }

        public DbSet<UserSettings> UserSettings { get; set; }
        
        public DbSet<Meal> Meals { get; set; }
    }
}