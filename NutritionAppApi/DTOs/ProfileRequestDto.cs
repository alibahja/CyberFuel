namespace NutritionAppApi.DTOs
{
    public class ProfileRequestDto
    {
        public required int Age { get; set; }
        
        public required float Height { get; set; } // in cm
        
        public required float Weight { get; set; } // in kg
        
        public required float TargetWeight { get; set; } // in kg
        
        public string? Gender { get; set; } // Optional
        
        public required string GoalType { get; set; } // "Lose", "Maintain", "Gain"
        
        public required string ActivityLevel { get; set; } // "Sedentary", "Light", etc.
        
        public float? DailyCalorieTarget { get; set; } // Optional - will be calculated if not provided
    }

    public class ProfileResponseDto
    {
        public int Age { get; set; }
        
        public float Height { get; set; }
        
        public float Weight { get; set; }
        
        public float TargetWeight { get; set; }
        
        public string? Gender { get; set; }
        
        public string GoalType { get; set; } = string.Empty;
        
        public string ActivityLevel { get; set; } = string.Empty;
        
        public float DailyCalorieTarget { get; set; }
        
        public float DailyProteinTarget { get; set; }
        
        public float DailyCarbsTarget { get; set; }
        
        public float DailyFatsTarget { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
    }
}