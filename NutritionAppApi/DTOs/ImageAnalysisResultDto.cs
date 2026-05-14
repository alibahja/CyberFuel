namespace NutritionAppApi.DTOs
{
    public class ImageAnalysisResultDto
    {
    public List<string> DetectedFoods { get; set; } = new();
    public float EstimatedCalories { get; set; }
    // NEW: Add estimated macros
    public float? EstimatedProtein { get; set; }
    public float? EstimatedCarbs { get; set; }
    public float? EstimatedFats { get; set; }
    public string ConfidenceLevel { get; set; } = "Medium";
    public string RawResponse { get; set; } = string.Empty;
    public string ProviderName { get; set; } = string.Empty;
    }
}