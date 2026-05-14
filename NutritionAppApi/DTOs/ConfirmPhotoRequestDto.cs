namespace NutritionAppApi.DTOs
{
  public class PhotoAnalyzeRequestDto
{
    public required IFormFile ImageFile { get; set; } // For file upload
}

    public class PhotoAnalyzeResponseDto
    {
        public int PhotoAnalysisId { get; set; }
        public float EstimatedCalories { get; set; }
        public float FinalProtein { get; set; }
        public float FinalCarbs { get; set; }
        public float FinalFats { get; set; }
        public string DetectedFoods { get; set; } = string.Empty;
        public string ConfidenceLevel { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsConfirmed { get; set; }
        public string AIServiceUsed { get; internal set; } = string.Empty;
        public DateTime CreatedAt { get; internal set; }
        public int? MealLogId { get; internal set; }
    }

public class ConfirmPhotoRequestDto
{
    public int PhotoAnalysisId { get; set; }
    public float? AdjustedCalories { get; set; }
    // NEW: User can adjust macros
    public float? AdjustedProtein { get; set; }
    public float? AdjustedCarbs { get; set; }
    public float? AdjustedFats { get; set; }
    public bool SaveAsMeal { get; set; } = true;
    public DateTime? MealDate { get; set; }
    public TimeSpan? MealTime { get; set; }
}
}